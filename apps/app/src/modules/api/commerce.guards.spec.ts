import { describe, expect, it } from "vitest"

import {
    parseCatalogItemRows,
    parseCatalogOrderRowAnswer,
    parseCatalogOrderRows,
    parseDomainRows,
    parseInvoiceRowAnswer,
    parseInvoiceRows,
    parseWalletRow,
    parseWalletTopUpPayLink,
    parseWalletTransactionRows,
} from "./commerce.guards"

describe("parseDomainRows", () => {
    it("refuses a row whose status the closed set does not name", () => {
        const row = { id: "d-1", name: "a.vn", status: "active", expiresAt: null, autoRenew: false }
        expect(parseDomainRows([row])).toHaveLength(1)
        expect(parseDomainRows([{ ...row, status: "parked" }])).toBeNull()
        expect(parseDomainRows({})).toBeNull()
    })
})

describe("parseWalletRow", () => {
    it("refuses a balance that is not a number", () => {
        expect(parseWalletRow({ id: "w-1", balanceVnd: 500 })).not.toBeNull()
        expect(parseWalletRow({ id: "w-1", balanceVnd: "500" })).toBeNull()
    })
})

describe("parseWalletTransactionRows", () => {
    it("refuses a movement kind the ledger does not name", () => {
        const row = { id: "t-1", amountVnd: 1, type: "deposit", note: null, createdAt: "t" }
        expect(parseWalletTransactionRows([row])).toHaveLength(1)
        expect(parseWalletTransactionRows([{ ...row, type: "refund" }])).toBeNull()
    })
})

describe("parseWalletTopUpPayLink", () => {
    it("refuses a gateway the wire grammar does not name", () => {
        const link = {
            paymentId: "p",
            gateway: "payos",
            referenceId: "r",
            checkoutUrl: "u",
            qrCode: null,
            checkoutFields: null,
            amountVnd: 1,
            chargedAmountVnd: 1,
        }
        expect(parseWalletTopUpPayLink(link)).not.toBeNull()
        expect(parseWalletTopUpPayLink({ ...link, gateway: "stripe" })).toBeNull()
    })
})

describe("parseInvoiceRows / parseInvoiceRowAnswer", () => {
    const invoice = {
        id: "i-1",
        amountVnd: 100,
        status: "unpaid",
        dueAt: "d",
        paidAt: null,
        catalogOrder: null,
    }

    it("refuses a status the invoice grammar does not name", () => {
        expect(parseInvoiceRows([invoice])).toHaveLength(1)
        expect(parseInvoiceRowAnswer(invoice)).not.toBeNull()
        expect(parseInvoiceRows([{ ...invoice, status: "overdue" }])).toBeNull()
        expect(parseInvoiceRowAnswer({ ...invoice, catalogOrder: "o-1" })).toBeNull()
    })
})

describe("parseCatalogOrderRows / parseCatalogOrderRowAnswer", () => {
    const order = { id: "o-1", status: "active", catalogItem: null, catalogTier: null }

    it("refuses a lifecycle state the closed set does not name and a malformed additive field", () => {
        expect(parseCatalogOrderRows([order])).toHaveLength(1)
        expect(parseCatalogOrderRowAnswer(order)).not.toBeNull()
        expect(parseCatalogOrderRows([{ ...order, status: "halfway" }])).toBeNull()
        expect(parseCatalogOrderRowAnswer({ ...order, autoRenew: "yes" })).toBeNull()
    })
})

describe("parseCatalogItemRows", () => {
    it("refuses an item whose tiers hold a malformed tier row", () => {
        const item = {
            id: "c-1",
            slug: "site",
            name: "Site",
            tagline: null,
            templateKey: null,
            tiers: [{ id: "t-1", tierKey: "base", name: "Base", priceMonthlyVnd: null, orderIndex: 0 }],
        }
        expect(parseCatalogItemRows([item])).toHaveLength(1)
        expect(
            parseCatalogItemRows([{ ...item, tiers: [{ id: "t-1", tierKey: "base", name: "Base", priceMonthlyVnd: "x", orderIndex: 0 }] }]),
        ).toBeNull()
        expect(parseCatalogItemRows([{ ...item, tiers: "many" }])).toBeNull()
    })
})
