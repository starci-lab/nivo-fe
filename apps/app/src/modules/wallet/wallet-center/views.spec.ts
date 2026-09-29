import type { useTranslations } from "next-intl"
import { describe, expect, it } from "vitest"
import type { InvoiceRow } from "@/modules/api/commerce"
import { createWalletSectionViews } from "./views"

const t: ReturnType<typeof useTranslations<"console">> = Object.assign(
    <Key extends string>(key: Key, ...values: Array<unknown>) => {
        void values
        return key
    },
    {
        rich: <Key extends string>(key: Key, ...values: Array<unknown>) => {
            void values
            return key
        },
        markup: <Key extends string>(key: Key, ...values: Array<unknown>) => {
            void values
            return key
        },
        raw: <Key extends string>(key: Key) => key,
        has: <Key extends string>(key: Key) => key.length >= 0,
    },
)
const invoice: InvoiceRow = {
    id: "invoice-1",
    amountVnd: 500000,
    status: "unpaid",
    dueAt: "2026-09-30T00:00:00.000Z",
    paidAt: null,
    catalogOrder: {
        id: "order-1",
        catalogItem: { id: "agentos", name: "AgentOS" },
        catalogTier: { id: "growth", name: "Growth" },
    },
}

describe("createWalletSectionViews", () => {
    it("projects balance, transactions and a correlated invoice from the returned evidence", () => {
        const result = createWalletSectionViews({
            walletAnswer: { ok: true, data: { id: "wallet-1", balanceVnd: 700000 } },
            invoicesAnswer: { ok: true, data: [invoice] },
            movements: {
                ok: true,
                data: [
                    {
                        id: "movement-1",
                        amountVnd: 25000,
                        type: "deposit",
                        note: null,
                        createdAt: "2026-09-30T00:00:00.000Z",
                    },
                ],
            },
            waypoint: { orderId: "order-1", invoiceId: "invoice-1", returnTo: "/en/agentos/orders/order-1" },
            payingInvoice: false,
            paymentError: null,
            t,
            amount: (value) => `${value} VND`,
            day: () => "30/09/2026",
        })

        expect(result.balance).toMatchObject({ phase: "answered", facts: [{ id: "balance", value: "700000 VND" }] })
        expect(result.transactions).toMatchObject({ phase: "answered", rows: [{ id: "movement-1", tone: "success" }] })
        expect(result.linkedInvoice).toMatchObject({
            phase: "answered",
            actionKind: "pay",
            row: { title: "AgentOS · Growth" },
        })
        expect(result.invoices).toMatchObject({ phase: "answered", rows: [] })
    })
})
