import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import {
    WalletControlCenterBase,
    type BalanceSectionView,
    type LedgerSectionView,
    type PaymentResultView,
    type TopUpView,
    type WalletControlCenterActions,
    type WalletControlCenterViewProps,
} from "./component"

const balance: BalanceSectionView = {
    phase: "answered",
    label: "Available balance",
    actionLabel: "Top up",
    facts: [{ id: "balance", label: "Balance", value: "500,000 VND" }],
}
const transactions: LedgerSectionView = { phase: "empty", label: "Transactions", note: "No transactions" }
const invoices: LedgerSectionView = { phase: "empty", label: "Invoices", note: "No invoices" }
const topUp: TopUpView = {
    overlayState: "closed",
    title: "Top up",
    closeLabel: "Close",
    amountLabel: "Amount",
    amountPlaceholder: "Enter an amount",
    hint: "Minimum 10,000 VND",
    submitLabel: "Continue",
    amount: "",
    pending: false,
}
const result: PaymentResultView = {
    overlayState: "closed",
    title: "Payment result",
    closeLabel: "Close",
    state: "Pending",
    tone: "warning",
    amount: "500,000 VND",
    note: "Balance reconciliation is pending.",
    actionLabel: "Back to Wallet",
}
const on: WalletControlCenterActions = { topUp: vi.fn(), payInvoice: vi.fn(), returnToOrder: vi.fn() }
const shared = { title: "Wallet", balance, transactions, invoices, topUp, result, on }

describe("WalletControlCenter drawing", () => {
    it("uses the ordinary page architecture without a linked invoice section", () => {
        const props: WalletControlCenterViewProps = { state: "ordinary", ...shared }
        const html = renderToStaticMarkup(<WalletControlCenterBase {...props} />)

        expect(html).toContain("Available balance")
        expect(html).not.toContain("Linked invoice")
    })

    it("uses the waypoint architecture and requires its linked invoice section", () => {
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

    it("draws resting, refusal, answered ledger detail, and checkout evidence branches", () => {
        const props: WalletControlCenterViewProps = {
            state: "ordinary",
            title: "Wallet",
            balance: { phase: "refused", label: "Balance", note: "Balance unavailable" },
            transactions: { phase: "resting", label: "Transactions" },
            invoices: {
                phase: "answered",
                label: "Invoices",
                actionLabel: "Pay",
                rows: [{
                    id: "invoice",
                    title: "Invoice 42",
                    caption: "Due today",
                    amount: "500,000 VND",
                    state: "Unpaid",
                    tone: "warning",
                    detailLabel: "View invoice",
                    detailFacts: [{ id: "amount", label: "Amount", value: "500,000 VND" }],
                    note: "Payment is pending",
                }],
            },
            topUp: { ...topUp, overlayState: "open", checkout: { reference: "REF-42", amount: "500,000 VND", note: "Redirecting" } },
            result: { ...result, overlayState: "open", reference: "REF-42" },
            on,
        }
        const html = renderToStaticMarkup(<WalletControlCenterBase {...props} />)

        expect(html).toContain("Balance unavailable")
        expect(html).toContain("Invoice 42")
    })

    it("renders checkout evidence inside the open top-up overlay", () => {
        render(<WalletControlCenterBase
            state="ordinary"
            {...shared}
            topUp={{ ...topUp, overlayState: "open", checkout: { reference: "REF-42", amount: "500,000 VND", note: "Redirecting" } }}
        />)

        expect(screen.getByText("REF-42")).toBeInTheDocument()
        expect(screen.getByText("Redirecting")).toBeInTheDocument()
    })

    it("renders resting and refused linked-invoice states independently", () => {
        const resting: WalletControlCenterViewProps = {
            state: "waypoint",
            ...shared,
            linkedInvoice: { phase: "resting", label: "Linked invoice", orderLabel: "Order 42" },
        }
        const refused: WalletControlCenterViewProps = {
            state: "waypoint",
            ...shared,
            linkedInvoice: { phase: "refused", label: "Linked invoice", note: "Invoice unavailable" },
        }

        expect(renderToStaticMarkup(<WalletControlCenterBase {...resting} />)).toContain("Linked invoice")
        expect(renderToStaticMarkup(<WalletControlCenterBase {...refused} />)).toContain("Invoice unavailable")
    })

    it("reports the linked return action and both modal dismissals", () => {
        const closeTopUp = vi.fn()
        const closeResult = vi.fn()
        const returnToOrder = vi.fn()
        const props: WalletControlCenterViewProps = {
            state: "waypoint",
            ...shared,
            linkedInvoice: {
                phase: "answered",
                label: "Linked invoice",
                orderLabel: "Order 42",
                row: {
                    id: "invoice", title: "Invoice", caption: "Paid", amount: "500,000 VND", state: "Paid", tone: "success", detailLabel: "Details", detailFacts: [],
                },
                actionLabel: "Return to order",
                actionKind: "return",
                actionDisabled: false,
                consequence: "Continue the order",
            },
            topUp: { ...topUp, overlayState: "open" },
            result: { ...result, overlayState: "open" },
            on: { ...on, closeTopUp, closeResult, returnToOrder },
        }
        render(<WalletControlCenterBase {...props} />)

        fireEvent.click(screen.getByRole("button", { name: "Return to order", hidden: true }))
        fireEvent.click(screen.getAllByRole("button", { name: "Close", hidden: true })[0])
        fireEvent.click(screen.getAllByRole("button", { name: "Close", hidden: true })[1])

        expect(returnToOrder).toHaveBeenCalledTimes(1)
        expect(closeTopUp).toHaveBeenCalledTimes(1)
        expect(closeResult).toHaveBeenCalledTimes(1)
    })
})
