import type { AgentosAiKnowledgeReadiness } from "@/modules/api/agentos-knowledge"
import type { WorkspaceCheckoutOffer } from "@/modules/api/workspace-controlplane"
import type { AgentOSFlow } from "./index"

type CopyCatalog = ((key: string) => string) & { readonly has: (key: string) => boolean }
/** One resolved lifecycle milestone in the AgentOS progress rail. */
type AgentOSStepView = {
    readonly ordinal: string
    readonly label: string
    readonly state: "done" | "current" | "upcoming"
    readonly stateLabel: string
}
/** Render-ready AgentOS state, copy, progress, and event handlers. */
export type AgentOSProvisioningViewProps = {
    readonly readinessMode?: boolean
    readonly state:
        | "catalog_loading"
        | "request"
        | "submitting"
        | "awaiting_payment"
        | "payment_unknown"
        | "accepted"
        | "preparing"
        | "provisioning_unknown"
        | "ready"
        | "failed"
    readonly props: {
        readonly progressLabel?: string
        readonly continuationLabel?: string
        readonly steps: ReadonlyArray<AgentOSStepView>
        readonly subject: string
        readonly detail: string
        readonly statusTitle: string
        readonly statusText: string
        readonly requestActionLabel?: string
        readonly requestActionDisabled?: boolean
        readonly statusActionLabel?: string
        readonly statusActionDisabled?: boolean
        readonly isRequestPending?: boolean
        readonly selection?: {
            readonly label: string
            readonly chooseOffer: string
            readonly chooseTier: string
            readonly selected: string
            readonly offers: ReadonlyArray<{
                readonly id: string
                readonly label: string
                readonly description?: string
                readonly tiers: ReadonlyArray<{ readonly id: string; readonly label: string; readonly detail?: string }>
            }>
            readonly selectedOfferId?: string
            readonly selectedTierId?: string
        }
    }
    readonly on?: {
        readonly request?: () => void
        readonly selectOffer?: (id: string) => void
        readonly selectTier?: (id: string) => void
        readonly statusAction?: () => void
    }
}

/** Data required to resolve one localized AgentOS phase into the block view. */
type AgentOSProvisioningViewInput = {
    readonly flow: AgentOSFlow
    readonly steps: ReadonlyArray<AgentOSStepView>
    readonly t: CopyCatalog
    readonly tShared: CopyCatalog
    readonly readiness: AgentosAiKnowledgeReadiness | null | undefined
    readonly readinessFailure: { readonly kind: string; readonly retryable: boolean; readonly text: string } | null
    readonly realtimeStatus: string
    readonly entryRefusal: string | null
    readonly reconciling: boolean
    readonly entryPending: boolean
    readonly aiRetryPending: boolean
    readonly amountOf: (offer: WorkspaceCheckoutOffer) => string
    readonly actions: {
        readonly submit: () => void
        readonly selectOffer: (id: string) => void
        readonly statusAction: () => void
        readonly enterWorkspace: () => void
        readonly retryAiReadiness: () => void
        readonly backToAgentOS: () => void
        readonly watchPurchase: (orderId: string) => void
    }
}

/** Copy-only view model for the connected AgentOS phase. */
export const agentOSProvisioningView = (input: AgentOSProvisioningViewInput): AgentOSProvisioningViewProps => {
    const { flow, steps, t, tShared, readiness, readinessFailure, realtimeStatus, entryRefusal } = input
    const { amountOf, actions } = input
    const progress = { progressLabel: t("agentos.progressLabel"), continuationLabel: t("agentos.continuationLabel") }
    const basic = (subject: string, detail: string, statusTitle: string, statusText: string) => ({
        ...progress,
        steps,
        subject,
        detail,
        statusTitle,
        statusText,
    })

    if (flow.phase === "catalog_loading")
        return {
            state: flow.phase,
            props: basic(input.t("agentos.productName"), t("loadingText"), t("loadingTitle"), t("loadingText")),
        }
    if (flow.phase === "request") {
        const detail = flow.offer === null ? t("agentos.chooseOffer") : `${flow.offer.displayName} · ${amountOf(flow.offer)}`
        return {
            state: flow.phase,
            props: {
                ...basic(flow.offer?.displayName ?? input.t("agentos.productName"), detail, t("agentos.requestTitle"), t("agentos.requestText")),
                requestActionLabel: t("agentos.submit"),
                requestActionDisabled: flow.offer === null || flow.verdict !== "current",
                selection: {
                    label: t("agentos.selectionLabel"),
                    chooseOffer: t("agentos.chooseOffer"),
                    chooseTier: t("agentos.chooseTier"),
                    selected: t("agentos.selected"),
                    offers: flow.catalogue.map((offer) => ({
                        id: offer.offerId,
                        label: offer.displayName,
                        description: `${amountOf(offer)} · ${offer.includedOutcome}`,
                        tiers: [],
                    })),
                    selectedOfferId: flow.offer?.offerId,
                },
            },
            on: { request: actions.submit, selectOffer: actions.selectOffer },
        }
    }
    if (flow.phase === "failed")
        return {
            state: "failed",
            props: { ...basic(flow.subject, flow.detail, t("failedTitle"), flow.reason), statusActionLabel: t("agentos.startAgain") },
            on: { statusAction: actions.backToAgentOS },
        }
    if (flow.phase === "awaiting_payment")
        return {
            state: flow.phase,
            props: {
                ...basic(flow.subject, flow.detail, t("agentos.paymentTitle"), t("agentos.paymentText")),
                statusActionLabel: tShared("agentos.purchaseStatus.checkPaymentAction"),
            },
            on: { statusAction: () => actions.watchPurchase(flow.orderId) },
        }
    if (flow.phase === "payment_unknown" || flow.phase === "provisioning_unknown")
        return {
            state: flow.phase,
            props: {
                ...basic(
                    flow.subject,
                    flow.detail,
                    flow.phase === "payment_unknown" ? t("agentos.paymentTitle") : t("agentos.acceptedTitle"),
                    flow.reason,
                ),
                statusActionLabel: tShared("agentos.retry"),
                isRequestPending: input.reconciling,
            },
            on: { statusAction: actions.statusAction },
        }
    if (flow.phase === "ready") {
        if (readiness?.aiReady === true)
            return {
                readinessMode: true,
                state: "ready",
                props: {
                    ...basic(flow.subject, flow.detail, t("readyTitle"), entryRefusal ?? t("agentos.aiReady")),
                    statusActionLabel: t("agentos.manage"),
                    isRequestPending: input.entryPending,
                },
                on: { statusAction: actions.enterWorkspace },
            }
        const operationsSettled =
            readiness?.readinessOperationId === null && readiness.knowledgeRecoveryOperationId === null
        if (
            readiness === null ||
            (readiness?.failureCode !== null && readiness?.failureCode !== undefined && operationsSettled)
        )
            return {
                readinessMode: true,
                state: "failed",
                props: {
                    ...basic(
                        flow.subject,
                        flow.detail,
                        t("failedTitle"),
                        readinessFailure === null
                            ? (readiness?.failureCode ?? t("failedLoad"))
                            : readinessFailure.text,
                    ),
                    statusActionLabel: readinessFailure !== null && !readinessFailure.retryable ? undefined : t("agentos.retryAi"),
                    isRequestPending: input.aiRetryPending,
                },
                on: { statusAction: actions.retryAiReadiness },
            }
        const statusText =
            readiness === undefined
                ? t("agentos.aiLoading")
                : readiness.knowledgeRecoveryOperationId !== null
                  ? t("agentos.aiRecovering")
                  : t("agentos.aiTesting")
        return {
            readinessMode: true,
            state: "preparing",
            props: {
                ...basic(flow.subject, flow.detail, t("preparingTitle"), statusText),
                statusActionLabel: t("agentos.watchProvisioning"),
                statusActionDisabled: true,
            },
        }
    }
    const isAccepted = flow.phase === "accepted"
    return {
        state: flow.phase,
        props: {
            ...basic(
                flow.subject,
                flow.detail,
                isAccepted ? t("agentos.acceptedTitle") : t("preparingTitle"),
                realtimeStatus === "connecting"
                    ? t("connecting")
                    : isAccepted
                      ? t("agentos.acceptedText")
                      : t("agentos.preparingText"),
            ),
            statusActionLabel: isAccepted ? t("agentos.watchFulfillment") : t("agentos.watchProvisioning"),
            statusActionDisabled: true,
        },
    }
}
