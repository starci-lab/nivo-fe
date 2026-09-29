import { afterEach, describe, expect, it, vi } from "vitest"
import {
    readWorkspaceCheckoutStatus,
    recoverWorkspacePurchase,
    resolveWorkspaceCheckoutEntry,
} from "./index"
import { checkoutStatus, envelope, requestBody, requestVariables } from "./spec-helpers"
describe("readWorkspaceCheckoutStatus", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("reads each facet from its owning source and never promotes settlement into readiness", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("workspacePurchaseStatus", {
                status: "status",
                purchaseId: "purchase-1",
                purchase: checkoutStatus,
            }),
        )
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspaceCheckoutStatus("purchase-1")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status === "status" && result.data.purchase.billing.source).toBe("platform-billing-ledger")
        expect(result.data.status === "status" && result.data.purchase.provisioning.disposition).toBe("provisioning")
        expect(result.data.status === "status" && result.data.purchase.readiness.state).toBe("pending")
        expect(result.data.status === "status" && result.data.purchase.serviceEligibility?.renewalEvidence).toBe("none")
        expect(result.data.status === "status" && result.data.purchase.ledger?.entries[0]?.paymentRail).toBe("vnpay")
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("workspacePurchaseStatus(request: $request)")
        expect(requestVariables(fetchMock, 0).request).toEqual({ purchaseId: "purchase-1" })
    })

    it("keeps an unavailable source an unavailable facet rather than a terminal claim", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("workspacePurchaseStatus", {
                status: "unavailable",
                code: "source-unavailable",
                source: "platform-billing-ledger",
                purchaseId: "purchase-1",
            }),
        )
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspaceCheckoutStatus("purchase-1")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status).toBe("unavailable")
        expect(result.data.status === "unavailable" && result.data.source).toBe("platform-billing-ledger")
    })
})

describe("recoverWorkspacePurchase", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("reconciles through the identities the caller observed", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("workspacePurchaseRecover", {
                status: "status",
                purchaseId: "purchase-1",
                purchase: checkoutStatus,
            }),
        )
        vi.stubGlobal("fetch", fetchMock)

        const result = await recoverWorkspacePurchase({
            purchaseId: "purchase-1",
            lastObserved: { paymentAttemptId: "attempt-1", providerReference: "vnpay-tx-1" },
        })

        expect(result.ok).toBe(true)
        expect(result.ok && result.data.status).toBe("status")
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("workspacePurchaseRecover(request: $request)")
        expect(requestVariables(fetchMock, 0).request).toEqual({
            purchaseId: "purchase-1",
            lastObserved: { paymentAttemptId: "attempt-1", providerReference: "vnpay-tx-1" },
        })
    })

    it("sends no last-observed identities when the caller observed none", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("workspacePurchaseRecover", {
                status: "status",
                purchaseId: "purchase-1",
                purchase: checkoutStatus,
            }),
        )
        vi.stubGlobal("fetch", fetchMock)

        await recoverWorkspacePurchase({ purchaseId: "purchase-1" })

        expect(requestVariables(fetchMock, 0).request).toEqual({ purchaseId: "purchase-1" })
    })

    it("surfaces a conflicting reuse as a closed conflict answer", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("workspacePurchaseRecover", {
                status: "conflict",
                code: "observed-identity-mismatch",
                purchaseId: "purchase-1",
            }),
        )
        vi.stubGlobal("fetch", fetchMock)

        const result = await recoverWorkspacePurchase({
            purchaseId: "purchase-1",
            lastObserved: { paymentAttemptId: "attempt-stale" },
        })

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status).toBe("conflict")
        expect(result.data.status === "conflict" && result.data.code).toBe("observed-identity-mismatch")
    })
})

// The caller claims only the purchase it owns and the workspace it says is ready; the backend derives
// the readiness observation from its own confirmed record, so the wire request carries no readiness identity.
describe("resolveWorkspaceCheckoutEntry", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("returns the registered destination for the exact readiness-confirmed workspace", async () => {
        const destination = {
            workspaceId: "ws-1",
            ownerId: "owner-1",
            routeName: "workspace-dashboard",
            routeVersion: "1",
            context: { tab: "overview" },
        }
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("workspacePurchaseEntry", {
                status: "entry",
                purchaseId: "purchase-1",
                workspaceId: "ws-1",
                destination,
            }),
        )
        vi.stubGlobal("fetch", fetchMock)

        const result = await resolveWorkspaceCheckoutEntry({
            purchaseId: "purchase-1",
            workspaceId: "ws-1",
            returnContext: { name: "workspace-dashboard", version: "1" },
        })

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status === "entry" && result.data.destination).toEqual(destination)
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("workspacePurchaseEntry(request: $request)")
        expect(requestVariables(fetchMock, 0).request).toEqual({
            purchaseId: "purchase-1",
            workspaceId: "ws-1",
            returnContext: { name: "workspace-dashboard", version: "1" },
        })
    })

    it("returns the composed status instead of a destination while readiness is unconfirmed", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("workspacePurchaseEntry", {
                status: "not-ready",
                purchaseId: "purchase-1",
                purchase: checkoutStatus,
            }),
        )
        vi.stubGlobal("fetch", fetchMock)

        const result = await resolveWorkspaceCheckoutEntry({ purchaseId: "purchase-1", workspaceId: "ws-1" })

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status).toBe("not-ready")
        expect(result.data.status === "not-ready" && result.data.purchase.readiness.state).toBe("pending")
    })
})
