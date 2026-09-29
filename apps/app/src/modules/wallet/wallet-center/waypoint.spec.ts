import { describe, expect, it } from "vitest"
import { parseTopUpSession, readWalletWaypoint } from "./waypoint"

describe("readWalletWaypoint", () => {
    it("distinguishes an ordinary wallet URL from an exact continuation", () => {
        expect(readWalletWaypoint("", "en")).toBeUndefined()
        expect(readWalletWaypoint("?orderId=order-1&invoiceId=invoice-1&returnTo=%2Fen%2Fagentos%2Forders%2Forder-1", "en"))
            .toEqual({
                orderId: "order-1",
                invoiceId: "invoice-1",
                returnTo: "/en/agentos/orders/order-1",
            })
    })

    it("refuses incomplete and mismatched continuations", () => {
        expect(readWalletWaypoint("?orderId=order-1", "en")).toBeNull()
        expect(readWalletWaypoint("?orderId=order-1&invoiceId=invoice-1&returnTo=%2Fother", "en")).toBeNull()
    })
})

describe("parseTopUpSession", () => {
    it("returns stored payment evidence and ignores malformed data", () => {
        expect(
            parseTopUpSession(JSON.stringify({ amountVnd: 25000, startingBalanceVnd: 0, referenceId: "REF-1" })),
        ).toEqual({ amountVnd: 25000, startingBalanceVnd: 0, referenceId: "REF-1" })
        expect(parseTopUpSession("not-json")).toBeNull()
    })
})
