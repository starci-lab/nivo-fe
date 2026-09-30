import type { WorkspaceCheckoutAnswer, WorkspaceCheckoutStatusView } from "@/modules/api/workspace-controlplane"
import { entryPathOf, observedIdentitiesOf, purchaseOf } from "@/modules/agentos/purchase-source"
import { describe, expect, it } from "vitest"
import { phaseOf } from "./phase"

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

describe("purchase status phase", () => {
    it("reads payment and provisioning phases from their confirmed purchase facts", () => {
        expect(phaseOf(purchase())).toBe("payment-pending")
        expect(phaseOf(purchase({ state: "payment-outcome-unknown" }))).toBe("payment-unknown")
        expect(phaseOf(purchase({ state: "provisioning" }))).toBe("provisioning")
        expect(
            phaseOf(
                purchase({
                    state: "provisioning",
                    provisioning: { ...sourceFact("admitted", "provisioning-1"), disposition: "admitted", reason: null },
                }),
            ),
        ).toBe("queued")
    })

    it("settles readiness only from the readiness facet", () => {
        expect(phaseOf(purchase({ state: "ready" }))).toBe("ready")
        expect(phaseOf(purchase({ state: "ready", readiness: sourceFact("unavailable", null) }))).toBe("provisioning-unknown")
    })

    it("extracts checkout evidence and admits only readiness-confirmed recovery identities", () => {
        const record = purchase()
        const answer: WorkspaceCheckoutAnswer = { status: "status", purchaseId: record.purchaseId, purchase: record }
        expect(purchaseOf(answer)).toBe(record)
        expect(purchaseOf(null)).toBeNull()
        expect(observedIdentitiesOf(record)).toEqual({
            billingReceiptId: "receipt-1",
            provisioningOrderId: "provisioning-1",
            workspaceId: "workspace-1",
        })
        expect(observedIdentitiesOf(purchase({ readiness: sourceFact("not-ready", null) }))).not.toHaveProperty("workspaceId")
    })

    it("resolves only the registered workspace-shell destination", () => {
        expect(
            entryPathOf({
                workspaceId: "workspace-1",
                ownerId: "owner-1",
                routeName: "instance-management.workspace-shell",
                routeVersion: "1",
                context: {},
            }),
        ).toBe("/agentos/workspaces/workspace-1")
        expect(
            entryPathOf({
                workspaceId: "workspace-1",
                ownerId: "owner-1",
                routeName: "other.route",
                routeVersion: "1",
                context: {},
            }),
        ).toBeNull()
    })
})
