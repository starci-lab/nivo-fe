"use client"

import { useState } from "react"
import {
    useAgentOSProvisioningActions,
    useAgentOSProvisioningFlow,
    useAgentOSProvisioningPhase,
} from "@/hooks/provisioning"
import {
    INITIAL_AGENTOS_OFFER,
    type AgentOSContext,
    type AgentOSFlowOverride,
    type AgentOSOfferIdentity,
} from "@/modules/provisioning/agentos-flow"
import { agentOSProvisioningView } from "@/modules/provisioning/agentos-flow/view"
import { AgentOSProvisioningBase } from "./component"

/** Route identity owned by the AgentOS provisioning block. */
export type AgentOSProvisioningProps = { readonly context: AgentOSContext }

/** Own the route identity and compose the connected hooks into the AgentOS provisioning surface. */
export const AgentOSProvisioning = (props: AgentOSProvisioningProps) => {
    const [offerIdentity, setOfferIdentity] = useState<AgentOSOfferIdentity>(INITIAL_AGENTOS_OFFER)
    const [override, setOverride] = useState<AgentOSFlowOverride | null>(null)
    const flowState = useAgentOSProvisioningFlow({ context: props.context, offerIdentity, override })
    const phaseState = useAgentOSProvisioningPhase(flowState.flow)
    const actions = useAgentOSProvisioningActions({ flowState, phaseState, setOfferIdentity, setOverride })
    const view = agentOSProvisioningView({
        flow: flowState.flow,
        steps: phaseState.steps,
        t: flowState.t,
        tShared: flowState.tShared,
        readiness: phaseState.readiness,
        readinessFailure: phaseState.readinessFailure,
        realtimeStatus: flowState.realtime.status,
        entryRefusal: actions.visibleEntryRefusal,
        reconciling: actions.reconciling,
        entryPending: actions.entryPending,
        aiRetryPending: actions.aiRetryPending,
        amountOf: (offer) => phaseState.amountOf(offer.amount, offer.currency),
        actions,
    })
    return <AgentOSProvisioningBase {...view} />
}

export default AgentOSProvisioning
