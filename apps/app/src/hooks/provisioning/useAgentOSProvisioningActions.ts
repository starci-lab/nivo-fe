
import { useState, type Dispatch, type SetStateAction } from "react"
import { useTranslations } from "next-intl"
import { agentosHome, newWorkspaceCheckout, purchase as purchaseRoute } from "@/modules/routes"
import {
    resolveWorkspaceCheckoutEntry,
    type WorkspaceCheckoutStatusView,
} from "@/modules/api/workspace-controlplane"
import {
    useMutateRecoverWorkspacePurchaseSwr,
    useMutateRunAgentosAiReadinessTestSwr,
    useRouter,
} from "@/hooks"
import { entryPathOf, observedIdentitiesOf, purchaseOf } from "@/modules/agentos/purchase-source"
import {
    phaseFromPurchase,
    queryFailureText,
    type AgentOSFlow,
    type AgentOSFlowOverride,
    type AgentOSOfferIdentity,
} from "@/modules/provisioning/agentos-flow"
import type { useAgentOSProvisioningFlow } from "./useAgentOSProvisioningFlow"
import type { useAgentOSProvisioningPhase } from "./useAgentOSProvisioningPhase"
import { agentOSCopyOf } from "./provisioning.shared"

type FlowState = ReturnType<typeof useAgentOSProvisioningFlow>
type PhaseState = ReturnType<typeof useAgentOSProvisioningPhase>
type EntryRefusal = {
    readonly workspaceId: string
    readonly statusAnswer: FlowState["statusQuery"]["data"]
    readonly message: string
}
type UseAgentOSProvisioningActionsInput = {
    readonly flowState: FlowState
    readonly phaseState: PhaseState
    readonly setOfferIdentity: Dispatch<SetStateAction<AgentOSOfferIdentity>>
    readonly setOverride: Dispatch<SetStateAction<AgentOSFlowOverride | null>>
}

/** Actions for checkout selection, reconciliation, readiness, and registered workspace entry. */
export const useAgentOSProvisioningActions = (input: UseAgentOSProvisioningActionsInput) => {
    const { flowState, phaseState, setOfferIdentity, setOverride } = input
    const t = useTranslations("console.provisioningFlows")
    const tShared = useTranslations("console")
    const copy = agentOSCopyOf(t, tShared)
    const router = useRouter()
    const recoverPurchase = useMutateRecoverWorkspacePurchaseSwr()
    const retryReadiness = useMutateRunAgentosAiReadinessTestSwr(
        flowState.flow.phase === "ready" ? flowState.flow.workspaceId : undefined,
    )
    const [entryPending, setEntryPending] = useState(false)
    const [entryRefusal, setEntryRefusal] = useState<EntryRefusal | null>(null)
    const visibleEntryRefusal =
        flowState.flow.phase === "ready" &&
        entryRefusal?.workspaceId === flowState.flow.workspaceId &&
        entryRefusal.statusAnswer === flowState.statusQuery.data
            ? entryRefusal.message
            : null

    const submit = (): void => {
        const flow = flowState.flow
        if (flow.phase !== "request" || flow.offer === null || flow.verdict !== "current") return
        const query = new URLSearchParams({ offer: flow.offer.offerId, offerVersion: flow.offer.offerVersion })
        router.push(newWorkspaceCheckout(query))
    }

    const selectOffer = (id: string): void => {
        const flow = flowState.flow
        if (flow.phase !== "request") return
        const chosen = flow.catalogue.find((candidate) => candidate.offerId === id)
        if (chosen !== undefined) setOfferIdentity({ offerId: chosen.offerId, offerVersion: chosen.offerVersion })
    }

    const recover = async (purchase: WorkspaceCheckoutStatusView, fallback: AgentOSFlow): Promise<void> => {
        if (recoverPurchase.isMutating) return
        const statusAnswer = flowState.statusQuery.data
        const response = await recoverPurchase.trigger({
            purchaseId: purchase.purchaseId,
            lastObserved: observedIdentitiesOf(purchase),
        })
        if (response.ok) {
            const recovered = purchaseOf(response.data)
            if (recovered !== null) {
                setOverride({ flow: phaseFromPurchase(recovered, copy, flowState.productName), statusAnswer })
                return
            }
        }
        setOverride({ flow: fallback, statusAnswer })
    }

    const statusAction = async (): Promise<void> => {
        const flow = flowState.flow
        if (flow.phase !== "payment_unknown" && flow.phase !== "provisioning_unknown") return
        const answer = flowState.statusQuery.data
        const purchase = answer?.ok === true ? purchaseOf(answer.data) : null
        if (purchase !== null) await recover(purchase, flow)
        else await flowState.reconcile()
    }

    const enterWorkspace = async (): Promise<void> => {
        const flow = flowState.flow
        if (flow.phase !== "ready" || entryPending) return
        setEntryPending(true)
        setEntryRefusal(null)
        try {
            const answer = await resolveWorkspaceCheckoutEntry({
                purchaseId: flow.orderId,
                workspaceId: flow.workspaceId,
                returnContext: { name: "workspace-dashboard", version: "1" },
            })
            if (!answer.ok) {
                setEntryRefusal({
                    workspaceId: flow.workspaceId,
                    statusAnswer: flowState.statusQuery.data,
                    message: queryFailureText(answer.kind, copy.shared),
                })
                return
            }
            const entry = answer.data
            if (entry.status === "entry") {
                const path =
                    entry.workspaceId === flow.workspaceId && entry.destination.workspaceId === flow.workspaceId
                        ? entryPathOf(entry.destination)
                        : null
                if (path === null) {
                    setEntryRefusal({
                        workspaceId: flow.workspaceId,
                        statusAnswer: flowState.statusQuery.data,
                        message: tShared("refusal.unknown"),
                    })
                    return
                }
                router.push(path)
                return
            }
            if (entry.status === "not-ready") {
                setOverride({
                    flow: phaseFromPurchase(entry.purchase, copy, flowState.productName),
                    statusAnswer: flowState.statusQuery.data,
                })
                setEntryRefusal({
                    workspaceId: flow.workspaceId,
                    statusAnswer: flowState.statusQuery.data,
                    message: tShared("agentos.purchaseStatus.entryNotReadyNotice"),
                })
                return
            }
            setEntryRefusal({
                workspaceId: flow.workspaceId,
                statusAnswer: flowState.statusQuery.data,
                message: tShared(`agentos.purchaseStatus.entryRefusalLabel.${entry.code}`),
            })
        } catch {
            setEntryRefusal({
                workspaceId: flow.workspaceId,
                statusAnswer: flowState.statusQuery.data,
                message: tShared("refusal.unknown"),
            })
        } finally {
            setEntryPending(false)
        }
    }

    const retryAiReadiness = async (): Promise<void> => {
        await retryReadiness.trigger(crypto.randomUUID())
        await phaseState.refreshReadiness()
    }

    const backToAgentOS = (): void => router.push(agentosHome())
    const watchPurchase = (orderId: string): void => router.push(purchaseRoute(orderId))

    return {
        submit,
        selectOffer,
        statusAction,
        enterWorkspace,
        retryAiReadiness,
        backToAgentOS,
        watchPurchase,
        visibleEntryRefusal,
        reconciling: flowState.statusQuery.isValidating || recoverPurchase.isMutating,
        entryPending,
        aiRetryPending: retryReadiness.isMutating,
    }
}
