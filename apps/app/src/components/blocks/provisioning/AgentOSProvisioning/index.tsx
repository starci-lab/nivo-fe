"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useFormatter, useTranslations } from "next-intl"
import {
    useQueryMyAgentosAiKnowledgeReadinessSwr,
    useMutateRunAgentosAiReadinessTestSwr,
    useMutateRecoverWorkspacePurchaseSwr,
    useProvisioningRealtime,
    useQueryWorkspaceCheckoutEntrySwr,
    useQueryWorkspaceCheckoutOffersSwr,
    useQueryWorkspaceCheckoutStatusSwr,
    useRouter,
    useAccessToken,
    type ProvisioningTarget,
} from "@/hooks"

import {
    type WorkspaceCheckoutEntryDestination,
    type WorkspaceCheckoutEntryRequest,
    type WorkspaceCheckoutObservedIdentities,
    type WorkspaceCheckoutOffer,
    type WorkspaceCheckoutAnswer,
    type WorkspaceCheckoutStatusView,
} from "@/modules/api/workspace-controlplane"
import { nivoQueryData } from "@/modules/query"
import { AgentOSProvisioningBase, type AgentOSProvisioningViewProps } from "./component"

/** Route identity owned by the AgentOS provisioning block. */
export type AgentOSProvisioningProps = {
    readonly context:
        | {
              readonly mode: "new"
          }
        | {
              readonly mode: "resume"
              readonly orderId: string
          }
}
type AgentOSFlow =
    | {
          readonly phase: "catalog_loading"
      }
    | {
          readonly phase: "request"
          readonly catalogue: ReadonlyArray<WorkspaceCheckoutOffer>
          readonly offer: WorkspaceCheckoutOffer | null
          readonly verdict: string
      }
    | {
          readonly phase: "awaiting_payment"
          readonly orderId: string
          readonly subject: string
          readonly detail: string
      }
    | {
          readonly phase: "payment_unknown"
          readonly orderId: string
          readonly subject: string
          readonly detail: string
          readonly reason: string
      }
    | {
          readonly phase: "accepted"
          readonly orderId: string
          readonly subject: string
          readonly detail: string
      }
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

/** The namespaced copy reader, so the settlement below can read the same strings off the surface. */
type ProvisioningCopy = ReturnType<typeof useTranslations>

/** The offer identity this surface presents first; the boundary decides whether it may still be bought. */
const PRESENTED_OFFER_ID = "nivo-workspace-growth"
const PRESENTED_OFFER_VERSION = "draft-2026-09-22"
/** The registered workspace-shell destination the entry owner may return. */
const ENTRY_ROUTE_NAME = "instance-management.workspace-shell"

/** The purchase view one checkout outcome carries, when the arm carries one at all. */
const purchaseOf = (outcome: WorkspaceCheckoutAnswer | null): WorkspaceCheckoutStatusView | null =>
    outcome !== null && "purchase" in outcome && outcome.purchase !== undefined ? outcome.purchase : null

/**
 * The exact source identities the screen actually observed, sent on the safe-recovery call so the
 * backend can refuse a caller whose last view contradicts the confirmed record. `payment.reference`
 * is never forwarded: the reconciliation owner returns the provider reference or the attempt id in
 * the same slot, and claiming it as either could raise a false identity conflict.
 */
const observedIdentitiesOf = (purchase: WorkspaceCheckoutStatusView): WorkspaceCheckoutObservedIdentities => ({
    ...(purchase.billing.reference !== null ? { billingReceiptId: purchase.billing.reference } : {}),
    ...(purchase.provisioning.reference !== null ? { provisioningOrderId: purchase.provisioning.reference } : {}),
    ...(purchase.readiness.state === "ready" && purchase.readiness.reference !== null
        ? { workspaceId: purchase.readiness.reference }
        : {}),
})

/** The registered entry destination is a named route; only the workspace shell maps onto this app. */
const entryPathOf = (destination: WorkspaceCheckoutEntryDestination): string | null =>
    destination.routeName === ENTRY_ROUTE_NAME ? `/agentos/workspaces/${destination.workspaceId}` : null

/**
 * Settle one composed purchase view into the phase the flow is standing on.
 *
 * The purchase cursor is the process: only `paid` from the billing facet and `ready` from the
 * readiness facet are stronger claims, a `refused` or `unavailable` outcome answers without a
 * verdict, and an unsettled purchase continues on its own phase rather than inventing a workspace.
 */
const phaseFromPurchase = (
    purchase: WorkspaceCheckoutStatusView,
    t: ProvisioningCopy,
    tShared: ProvisioningCopy,
    productName: string,
): AgentOSFlow => {
    const purchaseId = purchase.purchaseId
    const detail = purchase.offer.displayName
    const stateLabel = (state: string): string => {
        const key = state.replace(/-([a-z])/g, (_match, letter: string): string => letter.toUpperCase())
        return tShared.has(`agentos.purchaseStatus.stateLabel.${key}`)
            ? tShared(`agentos.purchaseStatus.stateLabel.${key}`)
            : state
    }
    switch (purchase.state) {
        case "selected":
        case "payment-not-started":
        case "payment-pending":
            return { phase: "awaiting_payment", orderId: purchaseId, subject: productName, detail }
        case "payment-outcome-unknown":
            return {
                phase: "payment_unknown",
                orderId: purchaseId,
                subject: productName,
                detail,
                reason: tShared("agentos.purchaseStatus.paymentUnknownSubtitle"),
            }
        case "payment-refused":
        case "payment-failed":
        case "payment-cancelled":
            return {
                phase: "failed",
                orderId: purchaseId,
                subject: productName,
                detail,
                reason: stateLabel(purchase.state),
                atStep: 1,
            }
        case "paid":
            return { phase: "accepted", orderId: purchaseId, subject: productName, detail }
        case "provisioning": {
            const disposition = purchase.provisioning.state
            if (disposition === "unavailable" || disposition === "outcome-unknown") {
                return {
                    phase: "provisioning_unknown",
                    orderId: purchaseId,
                    subject: productName,
                    detail,
                    reason: purchase.provisioning.reason ?? t("failedLoad"),
                }
            }
            if (disposition === "refused" || disposition === "failed-retryable" || disposition === "failed-terminal") {
                return {
                    phase: "failed",
                    orderId: purchaseId,
                    subject: productName,
                    detail,
                    reason: purchase.provisioning.reason ?? t("failedProvision"),
                    atStep: 2,
                }
            }
            const readyWorkspace =
                purchase.readiness.state === "ready" && purchase.readiness.reference !== null
                    ? purchase.readiness.reference
                    : null
            if (disposition === "ready" && readyWorkspace !== null) {
                return {
                    phase: "ready",
                    orderId: purchaseId,
                    workspaceId: readyWorkspace,
                    subject: productName,
                    detail: readyWorkspace,
                }
            }
            return {
                phase: "preparing",
                orderId: purchaseId,
                workspaceId: readyWorkspace,
                subject: productName,
                detail,
            }
        }
        case "provisioning-refused":
            return {
                phase: "failed",
                orderId: purchaseId,
                subject: productName,
                detail,
                reason: purchase.provisioning.reason ?? stateLabel("provisioning-refused"),
                atStep: 2,
            }
        case "ready":
        case "renewed":
            if (purchase.readiness.state === "ready" && purchase.readiness.reference !== null) {
                return {
                    phase: "ready",
                    orderId: purchaseId,
                    workspaceId: purchase.readiness.reference,
                    subject: productName,
                    detail: purchase.readiness.reference,
                }
            }
            return purchase.readiness.state === "unavailable"
                ? {
                      phase: "provisioning_unknown",
                      orderId: purchaseId,
                      subject: productName,
                      detail,
                      reason: t("failedLoad"),
                  }
                : { phase: "preparing", orderId: purchaseId, workspaceId: null, subject: productName, detail }
    }
}

/** The one realtime subject a phase is waiting on, or nothing when it waits on no one. */
const realtimeTarget = (flow: AgentOSFlow): ProvisioningTarget | null => {
    if (flow.phase === "ready")
        return {
            kind: "workspace",
            id: flow.workspaceId,
        }
    if (
        flow.phase === "awaiting_payment" ||
        flow.phase === "payment_unknown" ||
        flow.phase === "accepted" ||
        flow.phase === "provisioning_unknown" ||
        (flow.phase === "preparing" && flow.workspaceId === null)
    )
        return {
            kind: "order",
            id: flow.orderId,
        }
    return null
}

/** Which of the four customer outcomes the flow is standing on. A failure keeps its outcome. */
const phaseIndexOf = (flow: AgentOSFlow): number => {
    if (flow.phase === "catalog_loading" || flow.phase === "request") return 0
    if (flow.phase === "awaiting_payment" || flow.phase === "payment_unknown") return 1
    if (flow.phase === "accepted" || flow.phase === "preparing" || flow.phase === "provisioning_unknown") return 2
    if (flow.phase === "failed") return flow.atStep
    return 3
}

/** Where one step sits relative to the step the flow is on. */
const stepState = (index: number, phaseIndex: number): "done" | "current" | "upcoming" => {
    if (index < phaseIndex) return "done"
    if (index === phaseIndex) return "current"
    return "upcoming"
}
const readinessMilestoneState = (index: number, current: number): "done" | "current" | "upcoming" => {
    if (current === -1) return index < 4 ? "done" : "current"
    return stepState(index, current)
}

/** Own the real purchase → payment → workspace lifecycle and its matching Socket.IO target. */
export const AgentOSProvisioning = (props: AgentOSProvisioningProps) => {
    const { context }: AgentOSProvisioningProps = props
    const t = useTranslations("console.provisioningFlows")
    const tShared = useTranslations("console")
    const format = useFormatter()
    const router = useRouter()
    const productName = t("agentos.productName")
    const accessToken = useAccessToken()
    const [flow, setFlow] = useState<AgentOSFlow>({
        phase: "catalog_loading",
    })
    const [aiRetryPending, setAiRetryPending] = useState(false)
    const [entryAsked, setEntryAsked] = useState(false)
    const [entryRefusal, setEntryRefusal] = useState<string | null>(null)
    const [reconciling, setReconciling] = useState(false)
    const contextMode = context.mode
    const resumeOrderId = context.mode === "resume" ? context.orderId : null
    const isResume = contextMode === "resume"
    const [presented, setPresented] = useState({ offerId: PRESENTED_OFFER_ID, offerVersion: PRESENTED_OFFER_VERSION })
    const offersQuery = useQueryWorkspaceCheckoutOffersSwr(
        presented.offerId,
        presented.offerVersion,
        !isResume && accessToken !== null,
    )
    const statusQuery = useQueryWorkspaceCheckoutStatusSwr(resumeOrderId ?? "", isResume && accessToken !== null)
    const recoverPurchase = useMutateRecoverWorkspacePurchaseSwr()
    const consumedEntry = useRef<unknown>(null)
    const readyWorkspaceId = flow.phase === "ready" ? flow.workspaceId : null
    const aiReadinessQuery = useQueryMyAgentosAiKnowledgeReadinessSwr(readyWorkspaceId ?? undefined, aiRetryPending)
    const retryReadiness = useMutateRunAgentosAiReadinessTestSwr(readyWorkspaceId ?? undefined)
    const refreshAiReadiness = aiReadinessQuery.mutate
    const aiReadiness = nivoQueryData(aiReadinessQuery.data)
    /* The entry request names the purchase and the exact workspace the readiness facet confirmed;
     the readiness observation itself is the backend's to derive, never a caller claim. */
    const entryRequest = useMemo<WorkspaceCheckoutEntryRequest>(
        () => ({
            purchaseId: resumeOrderId ?? "",
            workspaceId: readyWorkspaceId ?? "",
            returnContext: { name: "workspace-dashboard", version: "1" },
        }),
        [resumeOrderId, readyWorkspaceId],
    )
    const entryQuery = useQueryWorkspaceCheckoutEntrySwr(entryRequest, entryAsked && readyWorkspaceId !== null)
    const entryAnswer = entryQuery.data
    const refreshStatus = statusQuery.mutate
    const reconcile = useCallback(async (): Promise<void> => {
        if (!isResume) return
        setReconciling(true)
        try {
            await refreshStatus()
        } catch {
            /* A thrown re-read keeps the last confirmed truth on screen. */
        } finally {
            setReconciling(false)
        }
    }, [isResume, refreshStatus])
    /* The safe-recovery command reconciles the same purchase through the identities already observed. */
    const recover = useCallback(
        async (purchase: WorkspaceCheckoutStatusView, fallback: AgentOSFlow): Promise<void> => {
            if (recoverPurchase.isMutating) return
            setReconciling(true)
            try {
                const response = await recoverPurchase.trigger({
                    purchaseId: purchase.purchaseId,
                    lastObserved: observedIdentitiesOf(purchase),
                })
                if (response.ok) {
                    const recovered = purchaseOf(response.data)
                    if (recovered !== null) {
                        setFlow(phaseFromPurchase(recovered, t, tShared, productName))
                        return
                    }
                }
                setFlow(fallback)
            } finally {
                setReconciling(false)
            }
        },
        [productName, recoverPurchase, t, tShared],
    )
    /* A fresh offers answer opens the request step on the approved list; the owner-selected offer
     identity re-presents itself so the boundary's verdict follows the selection. */
    useEffect(() => {
        if (isResume || offersQuery.data === undefined) return
        const answer = offersQuery.data
        if (!answer.ok || answer.data.status !== "offers" || answer.data.offers.length === 0) {
            setFlow((current) =>
                current.phase === "catalog_loading" || current.phase === "request"
                    ? {
                          phase: "failed",
                          orderId: null,
                          subject: productName,
                          detail: "",
                          reason: !answer.ok
                              ? answer.reason
                              : answer.data.status === "refused"
                                ? answer.data.code
                                : t("failedLoad"),
                          atStep: 0,
                      }
                    : current,
            )
            return
        }
        const outcome = answer.data
        setFlow((current) => {
            if (current.phase !== "catalog_loading" && current.phase !== "request") return current
            return {
                phase: "request",
                catalogue: outcome.offers,
                offer:
                    outcome.offers.find(
                        (candidate) =>
                            candidate.offerId === presented.offerId &&
                            candidate.offerVersion === presented.offerVersion,
                    ) ?? null,
                verdict: outcome.selection.state,
            }
        })
    }, [isResume, offersQuery.data, presented, productName, t])
    /* A fresh status answer settles the resumed purchase into the phase its facets prove. */
    useEffect(() => {
        if (!isResume || resumeOrderId === null || statusQuery.data === undefined) return
        const answer = statusQuery.data
        if (!answer.ok) {
            setFlow({
                phase: "payment_unknown",
                orderId: resumeOrderId,
                subject: productName,
                detail: resumeOrderId,
                reason: answer.reason,
            })
            return
        }
        const outcome = answer.data
        const purchase = purchaseOf(outcome)
        if (purchase !== null) {
            if (purchase.purchaseId !== resumeOrderId) {
                setFlow({
                    phase: "failed",
                    orderId: resumeOrderId,
                    subject: productName,
                    detail: resumeOrderId,
                    reason: t("agentos.orderMissing"),
                    atStep: 0,
                })
                return
            }
            setFlow(phaseFromPurchase(purchase, t, tShared, productName))
            return
        }
        if (outcome.status === "refused") {
            setFlow({
                phase: "failed",
                orderId: resumeOrderId,
                subject: productName,
                detail: resumeOrderId,
                reason: outcome.code === "purchase-not-found-non-disclosing" ? t("agentos.orderMissing") : outcome.code,
                atStep: 0,
            })
            return
        }
        setFlow({
            phase: "payment_unknown",
            orderId: resumeOrderId,
            subject: productName,
            detail: resumeOrderId,
            reason:
                outcome.status === "unavailable" ||
                outcome.status === "conflict" ||
                outcome.status === "outcome-unknown"
                    ? outcome.code
                    : t("failedLoad"),
        })
    }, [isResume, productName, resumeOrderId, statusQuery.data, t, tShared])
    /* The entry answer decides the route: a registered destination to the bound workspace, otherwise
     the refusal the boundary returned - an unavailable owner never becomes an entered workspace. */
    useEffect(() => {
        if (!entryAsked || entryAnswer === undefined || consumedEntry.current === entryAnswer) return
        consumedEntry.current = entryAnswer
        setEntryAsked(false)
        if (!entryAnswer.ok) {
            setEntryRefusal(entryAnswer.reason)
            return
        }
        const entry = entryAnswer.data
        if (entry.status === "entry") {
            const path =
                entry.workspaceId === readyWorkspaceId && entry.destination.workspaceId === readyWorkspaceId
                    ? entryPathOf(entry.destination)
                    : null
            if (path === null) {
                setEntryRefusal(tShared("refusal.unknown"))
                return
            }
            router.push(path)
            return
        }
        if (entry.status === "not-ready") {
            setFlow((current) =>
                current.phase === "ready" ? phaseFromPurchase(entry.purchase, t, tShared, productName) : current,
            )
            setEntryRefusal(tShared("agentos.purchaseStatus.entryNotReadyNotice"))
            return
        }
        setEntryRefusal(tShared(`agentos.purchaseStatus.entryRefusalLabel.${entry.code}`))
    }, [entryAnswer, entryAsked, productName, readyWorkspaceId, router, t, tShared])
    const target = realtimeTarget(flow)
    const realtime = useProvisioningRealtime({
        accessToken,
        target,
    })
    /* A realtime event only re-reads the same purchase; it never settles the surface by itself. */
    const seenEventKey = useRef<string | null>(null)
    useEffect(() => {
        if (realtime.status !== "event" || !isResume) return
        const event = realtime.event
        const eventKey =
            "updatedAt" in event
                ? `${event.kind}:${event.id}:${event.updatedAt}`
                : `${event.kind}:${event.id}:${event.status}`
        if (seenEventKey.current === eventKey) return
        seenEventKey.current = eventKey
        if (event.kind === "order" && event.id === resumeOrderId) void reconcile()
        if (event.kind === "workspace" && readyWorkspaceId !== null && event.id === readyWorkspaceId) void reconcile()
    }, [isResume, readyWorkspaceId, realtime, reconcile, resumeOrderId])
    useEffect(() => {
        if (
            flow.phase !== "awaiting_payment" &&
            flow.phase !== "accepted" &&
            flow.phase !== "preparing" &&
            flow.phase !== "payment_unknown" &&
            flow.phase !== "provisioning_unknown"
        )
            return
        // Socket.IO is the fast path, while the owner-scoped snapshot is the recovery path
        // for a tab that reconnects after a terminal event has already been relayed.
        const timer = window.setInterval(() => {
            void reconcile()
        }, 4000)
        return () => window.clearInterval(timer)
    }, [flow.phase, reconcile])
    useEffect(() => {
        if (!isResume || realtime.status !== "connected" || flow.phase === "catalog_loading") return
        void reconcile()
    }, [flow.phase, isResume, realtime.status, reconcile])
    useEffect(() => {
        if (flow.phase !== "ready") setEntryRefusal(null)
    }, [flow.phase])
    /* The owner's chosen offer routes to the checkout review, which alone admits the purchase - the
     rail choice and the retry identity stay with that surface rather than being invented here. */
    const submit = () => {
        if (flow.phase !== "request" || flow.offer === null || flow.verdict !== "current") return
        const query = new URLSearchParams({ offer: flow.offer.offerId, offerVersion: flow.offer.offerVersion })
        router.push(`/agentos/workspaces/new/checkout?${query.toString()}`)
    }
    const selectOffer = (id: string) => {
        if (flow.phase !== "request") return
        const chosen = flow.catalogue.find((candidate) => candidate.offerId === id) ?? null
        if (chosen === null) return
        setPresented({ offerId: chosen.offerId, offerVersion: chosen.offerVersion })
        setFlow((current) => (current.phase === "request" ? { ...current, offer: chosen } : current))
    }
    const enterWorkspace = () => {
        if (readyWorkspaceId === null || entryAsked) return
        consumedEntry.current = null
        setEntryRefusal(null)
        setEntryAsked(true)
    }
    const phaseIndex = phaseIndexOf(flow)
    const stepLabels = [t("steps.request"), t("steps.payment"), t("steps.createWorkspace"), t("steps.ready")]
    const stateLabels = {
        done: t("stepState.done"),
        current: t("stepState.current"),
        upcoming: t("stepState.upcoming"),
    } as const
    let steps = stepLabels.map((label, index) => {
        const state = stepState(index, phaseIndex)
        return {
            ordinal: String(index + 1),
            label,
            state,
            stateLabel: stateLabels[state],
        }
    })
    if (flow.phase === "ready") {
        const milestones = [
            aiReadiness?.credentialStatus === "configured",
            Boolean(aiReadiness?.chatModel),
            (aiReadiness?.origins.length ?? 0) > 0 && aiReadiness?.knowledgeRecoveryOperationId === null,
            aiReadiness?.qdrantHealth === "healthy",
            aiReadiness?.aiReady === true,
        ]
        const current = milestones.findIndex((done) => !done)
        const readinessLabels = [
            t("steps.credential"),
            t("steps.deepseek"),
            t("steps.knowledge"),
            t("steps.qdrant"),
            t("steps.aiTest"),
        ]
        steps = readinessLabels.map((label, index) => {
            const state = readinessMilestoneState(index, current)
            return {
                ordinal: String(index + 1),
                label,
                state,
                stateLabel: stateLabels[state],
            }
        })
    }
    const retryAiReadiness = async () => {
        setAiRetryPending(true)
        await retryReadiness.trigger(crypto.randomUUID())
        await refreshAiReadiness()
        setAiRetryPending(false)
    }
    const viewLabels = {
        progressLabel: t("agentos.progressLabel"),
        continuationLabel: t("agentos.continuationLabel"),
    }
    const amountOf = (offer: WorkspaceCheckoutOffer): string => {
        const value = Number(offer.amount)
        return Number.isFinite(value)
            ? format.number(value, { style: "currency", currency: offer.currency, maximumFractionDigits: 0 })
            : `${offer.amount} ${offer.currency}`
    }
    const requestView = (
        requestFlow: Extract<
            AgentOSFlow,
            {
                readonly phase: "request"
            }
        >,
    ): AgentOSProvisioningViewProps => {
        const detail =
            requestFlow.offer === null
                ? t("agentos.chooseOffer")
                : `${requestFlow.offer.displayName} · ${amountOf(requestFlow.offer)}`
        return {
            state: requestFlow.phase,
            props: {
                ...viewLabels,
                steps,
                subject: requestFlow.offer?.displayName ?? productName,
                detail,
                statusTitle: t("agentos.requestTitle"),
                statusText: t("agentos.requestText"),
                requestActionLabel: t("agentos.submit"),
                requestActionDisabled: requestFlow.offer === null || requestFlow.verdict !== "current",
                selection: {
                    label: t("agentos.selectionLabel"),
                    chooseOffer: t("agentos.chooseOffer"),
                    chooseTier: t("agentos.chooseTier"),
                    selected: t("agentos.selected"),
                    offers: requestFlow.catalogue.map((offer) => ({
                        id: offer.offerId,
                        label: offer.displayName,
                        description: `${amountOf(offer)} · ${offer.includedOutcome}`,
                        tiers: [],
                    })),
                    selectedOfferId: requestFlow.offer?.offerId,
                },
            },
            on: {
                request: () => submit(),
                selectOffer,
            },
        }
    }
    const readyView = (
        readyFlow: Extract<
            AgentOSFlow,
            {
                readonly phase: "ready"
            }
        >,
    ): AgentOSProvisioningViewProps => {
        if (aiReadiness?.aiReady === true)
            return {
                state: "ready",
                props: {
                    ...viewLabels,
                    steps,
                    subject: readyFlow.subject,
                    detail: readyFlow.detail,
                    statusTitle: t("readyTitle"),
                    statusText: entryRefusal ?? t("agentos.aiReady"),
                    statusActionLabel: t("agentos.manage"),
                    isRequestPending: entryAsked,
                },
                on: {
                    statusAction: () => enterWorkspace(),
                },
            }
        const operationsSettled =
            aiReadiness?.readinessOperationId === null && aiReadiness.knowledgeRecoveryOperationId === null
        if (
            aiReadiness === null ||
            (aiReadiness?.failureCode !== null && aiReadiness?.failureCode !== undefined && operationsSettled)
        )
            return {
                state: "failed",
                props: {
                    ...viewLabels,
                    steps,
                    subject: readyFlow.subject,
                    detail: readyFlow.detail,
                    statusTitle: t("failedTitle"),
                    statusText: aiReadiness?.failureCode ?? t("failedLoad"),
                    statusActionLabel: t("agentos.retryAi"),
                    isRequestPending: aiRetryPending,
                },
                on: {
                    statusAction: () => void retryAiReadiness(),
                },
            }
        let statusText = t("agentos.aiTesting")
        if (aiReadiness === undefined) statusText = t("agentos.aiLoading")
        else if (aiReadiness.knowledgeRecoveryOperationId !== null) statusText = t("agentos.aiRecovering")
        return {
            state: "preparing",
            props: {
                ...viewLabels,
                steps,
                subject: readyFlow.subject,
                detail: readyFlow.detail,
                statusTitle: t("preparingTitle"),
                statusText,
                statusActionLabel: t("agentos.watchProvisioning"),
                statusActionDisabled: true,
            },
        }
    }
    const unknownView = (
        unknownFlow: Extract<
            AgentOSFlow,
            {
                readonly phase: "payment_unknown" | "provisioning_unknown"
            }
        >,
    ): AgentOSProvisioningViewProps => ({
        state: unknownFlow.phase,
        props: {
            ...viewLabels,
            steps,
            subject: unknownFlow.subject,
            detail: unknownFlow.detail,
            statusTitle:
                unknownFlow.phase === "payment_unknown" ? t("agentos.paymentTitle") : t("agentos.acceptedTitle"),
            statusText: unknownFlow.reason,
            statusActionLabel: tShared("agentos.retry"),
            isRequestPending: reconciling,
        },
        on: {
            statusAction: () => {
                const answer = statusQuery.data
                const purchase = answer !== undefined && answer.ok ? purchaseOf(answer.data) : null
                if (purchase !== null) {
                    void recover(purchase, unknownFlow)
                    return
                }
                void reconcile()
            },
        },
    })
    const view = (): AgentOSProvisioningViewProps => {
        switch (flow.phase) {
            case "catalog_loading":
                return {
                    state: flow.phase,
                    props: {
                        ...viewLabels,
                        steps,
                        subject: productName,
                        detail: t("loadingText"),
                        statusTitle: t("loadingTitle"),
                        statusText: t("loadingText"),
                    },
                }
            case "request":
                return requestView(flow)
            case "failed":
                return {
                    state: "failed",
                    props: {
                        ...viewLabels,
                        steps,
                        subject: flow.subject,
                        detail: flow.detail,
                        statusTitle: t("failedTitle"),
                        statusText: flow.reason,
                        statusActionLabel: t("agentos.startAgain"),
                    },
                    on: {
                        statusAction: () => router.push("/agentos"),
                    },
                }
            case "awaiting_payment":
                return {
                    state: flow.phase,
                    props: {
                        ...viewLabels,
                        steps,
                        subject: flow.subject,
                        detail: flow.detail,
                        statusTitle: t("agentos.paymentTitle"),
                        statusText: t("agentos.paymentText"),
                        statusActionLabel: tShared("agentos.purchaseStatus.checkPaymentAction"),
                    },
                    on: {
                        statusAction: () => router.push(`/agentos/workspaces/purchases/${flow.orderId}`),
                    },
                }
            case "payment_unknown":
            case "provisioning_unknown":
                return unknownView(flow)
            case "ready":
                return readyView(flow)
            case "accepted":
            case "preparing": {
                const isAccepted = flow.phase === "accepted"
                const settledText = isAccepted ? t("agentos.acceptedText") : t("agentos.preparingText")
                const statusText = realtime.status === "connecting" ? t("connecting") : settledText
                return {
                    state: flow.phase,
                    props: {
                        ...viewLabels,
                        steps,
                        subject: flow.subject,
                        detail: flow.detail,
                        statusTitle: isAccepted ? t("agentos.acceptedTitle") : t("preparingTitle"),
                        statusText,
                        statusActionLabel: isAccepted ? t("agentos.watchFulfillment") : t("agentos.watchProvisioning"),
                        statusActionDisabled: true,
                    },
                }
            }
        }
    }
    return <AgentOSProvisioningBase {...view()} />
}
export default AgentOSProvisioning
