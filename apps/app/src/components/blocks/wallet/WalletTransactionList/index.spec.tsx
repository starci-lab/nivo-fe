import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { WalletTransactionList } from "./index"

describe("WalletTransactionList", () => {
    it("shows invoice evidence and wires the linked return action", () => {
        const returnToOrder = vi.fn()
        render(
            <WalletTransactionList
                transactions={{ phase: "empty", label: "Transactions", note: "No transactions" }}
                invoices={{ phase: "empty", label: "Invoices", note: "No invoices" }}
                linkedInvoice={{
                    phase: "answered",
                    label: "Linked invoice",
                    orderLabel: "Order 42",
                    row: {
                        id: "invoice-42",
                        title: "AgentOS Growth",
                        caption: "Due today",
                        amount: "500,000 VND",
                        state: "Paid",
                        tone: "success",
                        detailLabel: "View detail",
                        detailFacts: [],
                    },
                    actionLabel: "Return to order",
                    actionKind: "return",
                    actionDisabled: false,
                    consequence: "Continue the order.",
                }}
                closeLabel="Close"
                on={{ returnToOrder }}
            />,
        )

        expect(screen.getByText("AgentOS Growth")).toBeInTheDocument()
        expect(screen.getByText("Continue the order.")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Return to order" }))
        expect(returnToOrder).toHaveBeenCalledTimes(1)
    })
})
