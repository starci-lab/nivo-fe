import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { WalletControlCenterBase } from "./component"
import type { WalletControlCenterViewProps } from "@/modules/wallet/wallet-center/types"

const shared = {
    title: "Wallet",
    balance: {
        phase: "answered" as const,
        label: "Available balance",
        actionLabel: "Top up",
        facts: [{ id: "balance", label: "Balance", value: "500,000 VND" }],
    },
    transactions: { phase: "empty" as const, label: "Transactions", note: "No transactions" },
    invoices: { phase: "empty" as const, label: "Invoices", note: "No invoices" },
    topUp: {
        overlayState: "closed" as const,
        title: "Top up",
        closeLabel: "Close",
        amountLabel: "Amount",
        amountPlaceholder: "Enter an amount",
        hint: "Minimum 10,000 VND",
        submitLabel: "Continue",
        amount: "",
        pending: false,
    },
    result: {
        overlayState: "closed" as const,
        title: "Payment result",
        closeLabel: "Close",
        state: "Pending",
        tone: "warning" as const,
        amount: "500,000 VND",
        note: "Balance reconciliation is pending.",
        actionLabel: "Back to Wallet",
    },
}

describe("WalletControlCenterBase", () => {
    it("uses ordinary wallet architecture without a linked invoice section", () => {
        const props: WalletControlCenterViewProps = { state: "ordinary", ...shared }
        const html = renderToStaticMarkup(<WalletControlCenterBase {...props} />)

        expect(html).toContain("Available balance")
        expect(html).not.toContain("Linked invoice")
    })

    it("uses waypoint architecture and carries its order invoice", () => {
        const props: WalletControlCenterViewProps = {
            state: "waypoint",
            ...shared,
            breadcrumb: { label: "Path", backLabel: "Return to order" },
            linkedInvoice: {
                phase: "answered",
                label: "Linked invoice",
                orderLabel: "Order 42",
                row: {
                    id: "invoice-42",
                    title: "AgentOS Growth",
                    caption: "Due today",
                    amount: "500,000 VND",
                    state: "Unpaid",
                    tone: "warning",
                    detailLabel: "View detail",
                    detailFacts: [],
                },
                actionLabel: "Pay invoice",
                actionKind: "pay",
                actionDisabled: false,
                consequence: "Payment continues this exact order.",
            },
        }
        const html = renderToStaticMarkup(<WalletControlCenterBase {...props} />)

        expect(html).toContain('data-mode="back"')
        expect(html).toContain("Return to order")
        expect(html).toContain("Payment continues this exact order.")
    })
})
