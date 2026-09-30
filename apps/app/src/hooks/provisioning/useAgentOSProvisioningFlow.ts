
import { useCallback } from "react"
import { useTranslations } from "next-intl"
import { useAccessToken } from "../auth/useAccessToken"
import useProvisioningRealtime from "../realtime/useProvisioningRealtime"
import { useEventRevalidationSwr } from "../swr/useEventRevalidationSwr"
import { useQueryWorkspaceCheckoutOffersSwr } from "../swr/queries/useQueryWorkspaceCheckoutOffersSwr"
import { useQueryWorkspaceCheckoutStatusSwr } from "../swr/queries/useQueryWorkspaceCheckoutStatusSwr"
import { settle } from "@nivo/api"
import {
    agentOSFlowFromAnswers,
    realtimeTarget,
    type AgentOSContext,
    type AgentOSFlowOverride,
    type AgentOSOfferIdentity,
} from "@/modules/provisioning/agentos-flow"
import { agentOSCopyOf } from "./provisioning.shared"

type UseAgentOSProvisioningFlowInput = {
    readonly context: AgentOSContext
    readonly offerIdentity: AgentOSOfferIdentity
    readonly override: AgentOSFlowOverride | null
}

/** Connected offer, purchase, and realtime reads for the AgentOS flow. */
export const useAgentOSProvisioningFlow = (input: UseAgentOSProvisioningFlowInput) => {
    const { context, offerIdentity, override } = input
    const t = useTranslations("console.provisioningFlows")
    const tShared = useTranslations("console")
    const copy = agentOSCopyOf(t, tShared)
    const productName = t("agentos.productName")
    const accessToken = useAccessToken()
    const isResume = context.mode === "resume"
    const orderId = context.mode === "resume" ? context.orderId : null
    const offersQuery = useQueryWorkspaceCheckoutOffersSwr(
        offerIdentity.offerId,
        offerIdentity.offerVersion,
        !isResume && accessToken !== null,
    )
    const statusQuery = useQueryWorkspaceCheckoutStatusSwr(orderId ?? "", isResume && accessToken !== null)
    const flow = agentOSFlowFromAnswers({
        context,
        offerIdentity,
        offersAnswer: offersQuery.data,
        statusAnswer: statusQuery.data,
        override,
        copy,
        productName,
    })
    const target = realtimeTarget(flow)
    const realtime = useProvisioningRealtime({ accessToken, target })
    const refreshStatus = statusQuery.mutate
    const reconcile = useCallback(async (): Promise<void> => {
        if (!isResume) return
        // The last confirmed purchase remains the visible truth until a read answers, so the outcome is not read.
        await settle(refreshStatus)
    }, [isResume, refreshStatus])
    const event = realtime.status === "event" ? realtime.event : null
    const eventKind = event?.kind
    const eventId = event?.id
    const eventStatus = event !== null && "status" in event ? event.status : undefined
    const eventUpdatedAt = event !== null && "updatedAt" in event ? event.updatedAt : undefined
    const eventKey =
        event === null
            ? null
            : eventUpdatedAt !== undefined
              ? `${event.kind}:${event.id}:${eventUpdatedAt}`
              : `${event.kind}:${event.id}:${eventStatus}`
    const readyWorkspaceId = flow.phase === "ready" ? flow.workspaceId : null

    const matchingEvent =
        eventKey !== null &&
        isResume &&
        ((eventKind === "order" && eventId === orderId) ||
            (eventKind === "workspace" && eventId === readyWorkspaceId))
    const refreshSignal = matchingEvent
        ? ["agentos-purchase", orderId ?? "", "event", eventKey ?? ""]
        : isResume && realtime.status === "connected" && flow.phase !== "catalog_loading"
          ? ["agentos-purchase", orderId ?? "", "connected", flow.phase]
          : null
    useEventRevalidationSwr(refreshSignal, reconcile)

    return { flow, t, tShared, productName, statusQuery, realtime, reconcile }
}
