import { afterEach, describe, expect, it, vi } from "vitest"
import { readWorkspaceCheckoutOffers, startWorkspaceCheckoutPurchase } from "./index"
import {
    checkoutOffer,
    checkoutStatus,
    envelope,
    refusal,
    requestBody,
    requestVariables,
} from "./spec-helpers"
describe("readWorkspaceCheckoutOffers", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("selects the exact offer version and answers the current approved offers", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("workspaceCheckoutOffers", {
                status: "offers",
                offers: [checkoutOffer],
                selection: { offerId: "offer-team", offerVersion: "v1", state: "current" },
            }),
        )
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspaceCheckoutOffers("offer-team", "v1")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status).toBe("offers")
        expect(result.data.status === "offers" && result.data.offers).toEqual([checkoutOffer])
        expect(result.data.status === "offers" && result.data.selection.state).toBe("current")
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("workspaceCheckoutOffers(request: $request)")
        expect(requestVariables(fetchMock, 0).request).toEqual({ offerId: "offer-team", offerVersion: "v1" })
    })

    it("keeps a stale selection verdict and the approved list in the same answer", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("workspaceCheckoutOffers", {
                status: "offers",
                offers: [checkoutOffer],
                selection: { offerId: "offer-team", offerVersion: "v0", state: "stale" },
            }),
        )
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspaceCheckoutOffers("offer-team", "v0")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status === "offers" && result.data.selection.state).toBe("stale")
        expect(result.data.status === "offers" && result.data.offers).toHaveLength(1)
    })

    it("carries an admission refusal with the verified-Login door it points at", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("workspaceCheckoutOffers", {
                status: "refused",
                code: "purchaser-not-admitted",
                nextAction: "login-verify-email",
                offers: [checkoutOffer],
            }),
        )
        vi.stubGlobal("fetch", fetchMock)

        const result = await readWorkspaceCheckoutOffers("offer-team", "v1")

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status).toBe("refused")
        expect(result.data.status === "refused" && result.data.code).toBe("purchaser-not-admitted")
        expect(result.data.status === "refused" && result.data.nextAction).toBe("login-verify-email")
        expect(result.data.status === "refused" && result.data.offers).toHaveLength(1)
    })
})

describe("startWorkspaceCheckoutPurchase", () => {
    afterEach(() => vi.unstubAllGlobals())

    it("admits the purchase under its retry key on the chosen rail and returns the provider action", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("workspaceCheckoutStart", {
                status: "prepared",
                purchaseId: "purchase-1",
                purchase: checkoutStatus,
                paymentAction: {
                    paymentAttemptId: "attempt-1",
                    provider: "vnpay",
                    kind: "redirect",
                    payload: { url: "https://sandbox.vnpayment.example/pay" },
                },
            }),
        )
        vi.stubGlobal("fetch", fetchMock)

        const result = await startWorkspaceCheckoutPurchase({
            retryKey: "start-purchase-1",
            offerId: "offer-team",
            offerVersion: "v1",
            paymentRail: "vnpay",
        })

        expect(result.ok).toBe(true)
        if (!result.ok) return
        expect(result.data.status).toBe("prepared")
        expect(result.data.status === "prepared" && result.data.paymentAction?.provider).toBe("vnpay")
        expect(result.data.status === "prepared" && result.data.purchase.state).toBe("paid")
        const body = requestBody(fetchMock, 0)
        expect(body.query).toContain("workspaceCheckoutStart(request: $request)")
        expect(requestVariables(fetchMock, 0).request).toEqual({
            retryKey: "start-purchase-1",
            offerId: "offer-team",
            offerVersion: "v1",
            paymentRail: "vnpay",
        })
    })

    it("carries the existing entitlement when the purchase is an explicit renewal", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(
            envelope("workspaceCheckoutStart", {
                status: "prepared",
                purchaseId: "purchase-2",
                purchase: { ...checkoutStatus, purchaseId: "purchase-2" },
                paymentAction: null,
            }),
        )
        vi.stubGlobal("fetch", fetchMock)

        await startWorkspaceCheckoutPurchase({
            retryKey: "renew-1",
            offerId: "offer-team",
            offerVersion: "v1",
            paymentRail: "momo",
            renewalEntitlementId: "entitlement-1",
        })

        expect(requestVariables(fetchMock, 0).request).toEqual({
            retryKey: "renew-1",
            offerId: "offer-team",
            offerVersion: "v1",
            paymentRail: "momo",
            renewalEntitlementId: "entitlement-1",
        })
    })

    it("reports a refused admission as a refusal and never as a prepared purchase", async () => {
        const fetchMock = vi.fn().mockResolvedValueOnce(refusal("workspaceCheckoutStart", "PURCHASER_NOT_ADMITTED"))
        vi.stubGlobal("fetch", fetchMock)

        const result = await startWorkspaceCheckoutPurchase({
            retryKey: "start-purchase-1",
            offerId: "offer-team",
            offerVersion: "v1",
            paymentRail: "vnpay",
        })

        expect(result).toMatchObject({ ok: false, reason: "refused", code: "PURCHASER_NOT_ADMITTED" })
    })
})
