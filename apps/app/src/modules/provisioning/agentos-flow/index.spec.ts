import type { WorkspaceCheckoutStatusView } from "@/modules/api/workspace-controlplane"
import { describe, expect, it } from "vitest"
import {
    phaseFromPurchase,
    phaseIndexOf,
    readinessMilestoneState,
    realtimeTarget,
    stepState,
} from "./index"

const sourceFact = (state: string, reference: string | null) => ({ source: "owner", state, reference, observedAt: null })
const purchase = (overrides: Partial<WorkspaceCheckoutStatusView> = {}): WorkspaceCheckoutStatusView => ({
    purchaseId: "purchase-1",
    state: "payment-pending",
    offer: {
        offerId: "offer-1",
        offerVersion: "v1",
        displayName: "Workspace",
        includedOutcome: "Workspace access",
        amount: "1000",
        currency: "USD",
        billingCadence: "monthly",
        renewalMode: "manual",
        eligibility: "eligible",
    },
    payment: sourceFact("pending", null),
    billing: sourceFact("paid", "receipt-1"),
    provisioning: { ...sourceFact("running", "provisioning-1"), disposition: "running", reason: null },
    readiness: sourceFact("ready", "workspace-1"),
    serviceEligibility: null,
    ledger: null,
    refund: null,
    refundStatus: null,
    lastConfirmedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
})
const copy = {
    flow: (key: string) => key,
    shared: (key: string) => key,
    hasShared: () => true,
}

describe("AgentOS flow derivations", () => {
    it("settles a ready purchase", () => {
        const ready = purchase({ state: "ready" })
        expect(phaseFromPurchase(ready, copy, "AgentOS")).toMatchObject({ phase: "ready", workspaceId: "workspace-1" })
    })

    it("keeps the phase rail and readiness milestone positions derived", () => {
        expect(phaseIndexOf({ phase: "awaiting_payment", orderId: "purchase-1", subject: "AgentOS", detail: "Workspace" })).toBe(1)
        expect(realtimeTarget({ phase: "ready", orderId: "purchase-1", workspaceId: "workspace-1", subject: "AgentOS", detail: "Workspace" }))
            .toEqual({ kind: "workspace", id: "workspace-1" })
        expect(stepState(0, 2)).toBe("done")
        expect(stepState(2, 2)).toBe("current")
        expect(readinessMilestoneState(4, -1)).toBe("current")
    })
})
