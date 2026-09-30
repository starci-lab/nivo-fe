import type { WorkspaceCheckoutOfferFieldsFragment, WorkspaceCheckoutPurchaseStatusFieldsFragment } from "@/modules/api/__generated__/core"

import type { WorkspaceCheckoutAnswer } from "@/modules/api/workspace-controlplane"
import type { NivoQueryFailure } from "@/modules/query"
import { type Outcome } from "@nivo/api"
import { purchaseOf } from "@/modules/agentos/purchase-source"

/** The settled phase of the AgentOS purchase and readiness journey. */

export type AgentOSFlow =
    | { readonly phase: "catalog_loading" }
    | {
          readonly phase: "request"
          readonly catalogue: ReadonlyArray<WorkspaceCheckoutOfferFieldsFragment>
          readonly offer: WorkspaceCheckoutOfferFieldsFragment | null
          readonly verdict: string
      }
    | { readonly phase: "awaiting_payment"; readonly orderId: string; readonly subject: string; readonly detail: string }
    | {
          readonly phase: "payment_unknown"
          readonly orderId: string
          readonly subject: string
          readonly detail: string
          readonly reason: string
      }
    | { readonly phase: "accepted"; readonly orderId: string; readonly subject: string; readonly detail: string }
    | {
          readonly phase: "preparing"
          readonly orderId: string
          readonly workspaceId: string | null
          readonly subject: string
          readonly detail: string
      }
    | {
          readonly phase: "provisioning_unknown"
          readonly orderId: string
          readonly subject: string
          readonly detail: string
          readonly reason: string
      }
    | {
          readonly phase: "ready"
          readonly orderId: string
          readonly workspaceId: string
          readonly subject: string
          readonly detail: string
      }
    | {
          readonly phase: "failed"
          readonly orderId: string | null
          readonly subject: string
          readonly detail: string
          readonly reason: string
          readonly atStep: 0 | 1 | 2 | 3
      }

/** Translation operations required to settle server vocabulary into customer copy. */
export type AgentOSCopy = {
    readonly flow: (key: string) => string
    readonly shared: (key: string) => string
    readonly hasShared: (key: string) => boolean
}

/** The exact status answer used to decide whether an action result still overlays the read. */
export type AgentOSFlowOverride = {
    readonly flow: AgentOSFlow
    readonly statusAnswer: Outcome<WorkspaceCheckoutAnswer> | undefined
}

/** The selected offer identity the purchase boundary currently answers for. */
export type AgentOSOfferIdentity = { readonly offerId: string; readonly offerVersion: string }
/** Route identity the AgentOS block owns. */
export type AgentOSContext = { readonly mode: "new" } | { readonly mode: "resume"; readonly orderId: string }

/** The only realtime resource kinds this flow subscribes to. */
type AgentOSRealtimeTarget =
    | { readonly kind: "order"; readonly id: string }
    | { readonly kind: "workspace"; readonly id: string }

/** The offer identity this surface presents first; the boundary decides whether it may be bought. */
export const INITIAL_AGENTOS_OFFER: AgentOSOfferIdentity = {
    offerId: "nivo-workspace-growth",
    offerVersion: "draft-2026-09-22",
}

/** The settled failure sentence for one owner-scoped read. */
export const queryFailureText = (kind: NivoQueryFailure["kind"], shared: AgentOSCopy["shared"]): string =>
    kind === "refused"
        ? shared("query.signInRequired")
        : kind === "forbidden"
          ? shared("query.forbidden")
          : kind === "not-found"
            ? shared("query.notFound")
            : kind === "invalid"
              ? shared("query.invalid")
              : shared("query.unavailable")

/** Settle one composed purchase view into the phase its confirmed facets prove. */
export const phaseFromPurchase = (
    purchase: WorkspaceCheckoutPurchaseStatusFieldsFragment,
    copy: AgentOSCopy,
    productName: string,
): AgentOSFlow => {
    const orderId = purchase.purchaseId
    const detail = purchase.offer.displayName
    const stateLabel = (state: string): string => {
        const key = state.replace(/-([a-z])/g, (_match, letter: string): string => letter.toUpperCase())
        const messageKey = `agentos.purchaseStatus.stateLabel.${key}`
        return copy.hasShared(messageKey) ? copy.shared(messageKey) : state
    }
    switch (purchase.state) {
        case "selected":
        case "payment-not-started":
        case "payment-pending":
            return { phase: "awaiting_payment", orderId, subject: productName, detail }
        case "payment-outcome-unknown":
            return {
                phase: "payment_unknown",
                orderId,
                subject: productName,
                detail,
                reason: copy.shared("agentos.purchaseStatus.paymentUnknownSubtitle"),
            }
        case "payment-refused":
        case "payment-failed":
        case "payment-cancelled":
            return { phase: "failed", orderId, subject: productName, detail, reason: stateLabel(purchase.state), atStep: 1 }
        case "paid":
            return { phase: "accepted", orderId, subject: productName, detail }
        case "provisioning": {
            const disposition = purchase.provisioning.state
            if (disposition === "unavailable" || disposition === "outcome-unknown")
                return {
                    phase: "provisioning_unknown",
                    orderId,
                    subject: productName,
                    detail,
                    reason: purchase.provisioning.reason ?? copy.flow("failedLoad"),
                }
            if (disposition === "refused" || disposition === "failed-retryable" || disposition === "failed-terminal")
                return {
                    phase: "failed",
                    orderId,
                    subject: productName,
                    detail,
                    reason: purchase.provisioning.reason ?? copy.flow("failedProvision"),
                    atStep: 2,
                }
            const readyWorkspace =
                purchase.readiness.state === "ready" && purchase.readiness.reference !== null
                    ? purchase.readiness.reference
                    : null
            if (disposition === "ready" && readyWorkspace !== null)
                return { phase: "ready", orderId, workspaceId: readyWorkspace, subject: productName, detail: readyWorkspace }
            return { phase: "preparing", orderId, workspaceId: readyWorkspace, subject: productName, detail }
        }
        case "provisioning-refused":
            return {
                phase: "failed",
                orderId,
                subject: productName,
                detail,
                reason: purchase.provisioning.reason ?? stateLabel("provisioning-refused"),
                atStep: 2,
            }
        case "ready":
        case "renewed":
            if (purchase.readiness.state === "ready" && purchase.readiness.reference !== null)
                return {
                    phase: "ready",
                    orderId,
                    workspaceId: purchase.readiness.reference,
                    subject: productName,
                    detail: purchase.readiness.reference,
                }
            return purchase.readiness.state === "unavailable"
                ? { phase: "provisioning_unknown", orderId, subject: productName, detail, reason: copy.flow("failedLoad") }
                : { phase: "preparing", orderId, workspaceId: null, subject: productName, detail }
        default:
            return {
                phase: "provisioning_unknown",
                orderId,
                subject: productName,
                detail,
                reason: stateLabel(purchase.state),
            }
    }
}

/** The one realtime subject a phase is waiting on. */
export const realtimeTarget = (flow: AgentOSFlow): AgentOSRealtimeTarget | null => {
    if (flow.phase === "ready") return { kind: "workspace", id: flow.workspaceId }
    if (
        flow.phase === "awaiting_payment" ||
        flow.phase === "payment_unknown" ||
        flow.phase === "accepted" ||
        flow.phase === "provisioning_unknown" ||
        (flow.phase === "preparing" && flow.workspaceId === null)
    )
        return { kind: "order", id: flow.orderId }
    return null
}

/** Which of the four customer outcomes the flow is standing on. */
export const phaseIndexOf = (flow: AgentOSFlow): number => {
    if (flow.phase === "catalog_loading" || flow.phase === "request") return 0
    if (flow.phase === "awaiting_payment" || flow.phase === "payment_unknown") return 1
    if (flow.phase === "accepted" || flow.phase === "preparing" || flow.phase === "provisioning_unknown") return 2
    if (flow.phase === "failed") return flow.atStep
    return 3
}

/** Where one step sits relative to the step the flow is on. */
export const stepState = (index: number, phaseIndex: number): "done" | "current" | "upcoming" =>
    index < phaseIndex ? "done" : index === phaseIndex ? "current" : "upcoming"

/** Readiness has five milestones; a completed readiness journey completes its first four. */
export const readinessMilestoneState = (index: number, current: number): "done" | "current" | "upcoming" =>
    current === -1 ? (index < 4 ? "done" : "current") : stepState(index, current)

/** Inputs for deriving the visible AgentOS phase from the current owner-scoped answers. */
type AgentOSFlowFromAnswersInput = {
    readonly context: AgentOSContext
    readonly offerIdentity: AgentOSOfferIdentity
    readonly offersAnswer: Outcome<WorkspaceCheckoutAnswer> | undefined
    readonly statusAnswer: Outcome<WorkspaceCheckoutAnswer> | undefined
    readonly override: AgentOSFlowOverride | null
    readonly copy: AgentOSCopy
    readonly productName: string
}

/** Derive the visible flow directly from the current query answers. */
export const agentOSFlowFromAnswers = (input: AgentOSFlowFromAnswersInput): AgentOSFlow => {
    const { context, offerIdentity, offersAnswer, statusAnswer, override, copy, productName } = input
    if (override !== null && override.statusAnswer === statusAnswer) return override.flow
    if (context.mode === "new") {
        if (offersAnswer === undefined) return { phase: "catalog_loading" }
        if (!offersAnswer.ok)
            return {
                phase: "failed",
                orderId: null,
                subject: productName,
                detail: "",
                reason: queryFailureText(offersAnswer.kind, copy.shared),
                atStep: 0,
            }
        const offers = offersAnswer.data
        if (offers.status !== "offers" || offers.offers.length === 0)
            return {
                phase: "failed",
                orderId: null,
                subject: productName,
                detail: "",
                reason: offers.status === "refused" ? offers.code : copy.flow("failedLoad"),
                atStep: 0,
            }
        return {
            phase: "request",
            catalogue: offers.offers,
            offer:
                offers.offers.find(
                    (candidate) =>
                        candidate.offerId === offerIdentity.offerId && candidate.offerVersion === offerIdentity.offerVersion,
                ) ?? null,
            verdict: offers.selection.state,
        }
    }

    const orderId = context.orderId
    if (statusAnswer === undefined)
        return { phase: "catalog_loading" }
    if (!statusAnswer.ok)
        return {
            phase: "payment_unknown",
            orderId,
            subject: productName,
            detail: orderId,
            reason: queryFailureText(statusAnswer.kind, copy.shared),
        }
    const outcome = statusAnswer.data
    const purchase = purchaseOf(outcome)
    if (purchase !== null) {
        if (purchase.purchaseId !== orderId)
            return { phase: "failed", orderId, subject: productName, detail: orderId, reason: copy.flow("agentos.orderMissing"), atStep: 0 }
        return phaseFromPurchase(purchase, copy, productName)
    }
    if (outcome.status === "refused")
        return {
            phase: "failed",
            orderId,
            subject: productName,
            detail: orderId,
            reason: outcome.code === "purchase-not-found-non-disclosing" ? copy.flow("agentos.orderMissing") : outcome.code,
            atStep: 0,
        }
    return {
        phase: "payment_unknown",
        orderId,
        subject: productName,
        detail: orderId,
        reason:
            outcome.status === "unavailable" || outcome.status === "conflict" || outcome.status === "outcome-unknown"
                ? outcome.code
                : copy.flow("failedLoad"),
    }
}
