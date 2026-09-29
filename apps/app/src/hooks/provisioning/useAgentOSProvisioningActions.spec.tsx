import { act, renderHook } from "@testing-library/react"
import { useState } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { INITIAL_AGENTOS_OFFER, type AgentOSFlowOverride, type AgentOSOfferIdentity } from "@/modules/provisioning/agentos-flow"

const mocks = vi.hoisted(() => ({
    offers: undefined as unknown,
    status: undefined as unknown,
    accessToken: "token" as string | null,
    recover: vi.fn(),
    retry: vi.fn(),
    push: vi.fn(),
}))
vi.mock("@/hooks", () => ({
    useAccessToken: () => mocks.accessToken,
    useProvisioningRealtime: () => ({ status: "disconnected" }),
    useQueryWorkspaceCheckoutOffersSwr: () => ({ data: mocks.offers, mutate: vi.fn(), isValidating: false }),
    useQueryWorkspaceCheckoutStatusSwr: () => ({ data: mocks.status, mutate: vi.fn(), isValidating: false }),
    useQueryMyAgentosAiKnowledgeReadinessSwr: () => ({ data: undefined, mutate: vi.fn() }),
    useMutateRecoverWorkspacePurchaseSwr: () => ({ trigger: mocks.recover, isMutating: false }),
    useMutateRunAgentosAiReadinessTestSwr: () => ({ trigger: mocks.retry, isMutating: false }),
    useRouter: () => ({ push: mocks.push, replace: vi.fn() }),
}))

import { useAgentOSProvisioningActions } from "./useAgentOSProvisioningActions"
import { useAgentOSProvisioningFlow } from "./useAgentOSProvisioningFlow"
import { useAgentOSProvisioningPhase } from "./useAgentOSProvisioningPhase"

describe("useAgentOSProvisioningActions", () => {
    beforeEach(() => {
        mocks.offers = {
            ok: true,
            data: {
                status: "offers",
                offers: [
                    { offerId: "offer-1", offerVersion: "v1", displayName: "One", includedOutcome: "One", amount: "1", currency: "USD", billingCadence: "monthly", renewalMode: "manual", eligibility: "current" },
                    { offerId: "offer-2", offerVersion: "v2", displayName: "Two", includedOutcome: "Two", amount: "2", currency: "USD", billingCadence: "monthly", renewalMode: "manual", eligibility: "current" },
                ],
                selection: { offerId: "offer-1", offerVersion: "v1", state: "current" },
            },
        }
        mocks.status = undefined
        mocks.accessToken = "token"
    })

    it("updates the exact selected offer identity", () => {
        const { result } = renderHook(() => {
            const [offerIdentity, setOfferIdentity] = useState<AgentOSOfferIdentity>(INITIAL_AGENTOS_OFFER)
            const [override, setOverride] = useState<AgentOSFlowOverride | null>(null)
            const flowState = useAgentOSProvisioningFlow({ context: { mode: "new" }, offerIdentity, override })
            const phaseState = useAgentOSProvisioningPhase(flowState.flow)
            const actions = useAgentOSProvisioningActions({ flowState, phaseState, setOfferIdentity, setOverride })
            return { actions, offerIdentity }
        })
        act(() => result.current.actions.selectOffer("offer-2"))
        expect(result.current.offerIdentity).toEqual({ offerId: "offer-2", offerVersion: "v2" })
    })
})
