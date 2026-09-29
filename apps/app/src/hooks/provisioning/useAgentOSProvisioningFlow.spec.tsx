import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    accessToken: "token" as string | null,
    offers: undefined as unknown,
    status: undefined as unknown,
    realtime: { status: "disconnected" as string },
}))

vi.mock("@/hooks", () => ({
    useAccessToken: () => mocks.accessToken,
    useProvisioningRealtime: () => mocks.realtime,
    useQueryWorkspaceCheckoutOffersSwr: () => ({ data: mocks.offers, mutate: vi.fn(), isValidating: false }),
    useQueryWorkspaceCheckoutStatusSwr: () => ({ data: mocks.status, mutate: vi.fn(), isValidating: false }),
}))

import { INITIAL_AGENTOS_OFFER } from "@/modules/provisioning/agentos-flow"
import { useAgentOSProvisioningFlow } from "./useAgentOSProvisioningFlow"

describe("useAgentOSProvisioningFlow", () => {
    beforeEach(() => {
        mocks.accessToken = "token"
        mocks.offers = {
            ok: true,
            data: {
                status: "offers",
                offers: [
                    {
                        offerId: INITIAL_AGENTOS_OFFER.offerId,
                        offerVersion: INITIAL_AGENTOS_OFFER.offerVersion,
                        displayName: "Workspace",
                        includedOutcome: "Workspace access",
                        amount: "1000",
                        currency: "USD",
                        billingCadence: "monthly",
                        renewalMode: "manual",
                        eligibility: "current",
                    },
                ],
                selection: { offerId: INITIAL_AGENTOS_OFFER.offerId, offerVersion: INITIAL_AGENTOS_OFFER.offerVersion, state: "current" },
            },
        }
        mocks.status = undefined
        mocks.realtime = { status: "disconnected" }
    })

    it("derives a request phase from the current offer answer", () => {
        const { result } = renderHook(() =>
            useAgentOSProvisioningFlow({ context: { mode: "new" }, offerIdentity: INITIAL_AGENTOS_OFFER, override: null }),
        )
        expect(result.current.flow).toMatchObject({ phase: "request", offer: { displayName: "Workspace" }, verdict: "current" })
    })
})
