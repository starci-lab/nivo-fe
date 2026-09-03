import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { OverviewAccountBase, type OverviewAccountFact, type OverviewAccountInvoiceRow } from "./component"

const facts: ReadonlyArray<OverviewAccountFact> = [
    { id: "balance", label: "Wallet balance", value: "150,000 ₫" },
    { id: "unpaid", label: "Unpaid invoices", value: "1 of 1" },
]
const invoiceRow: OverviewAccountInvoiceRow = {
    name: "Invoice INV-2026-0903",
    detail: "Unpaid · due 06 Sep 2026 · charged to the wallet above",
    statusLabel: "Due soon",
    badgeTone: "warning",
    actionLabel: "Top up wallet",
    onTopUp: vi.fn(),
}

describe("OverviewAccountBase", () => {
    it("draws the two-cell facts band and the one invoice row that owes the next step", () => {
        render(<OverviewAccountBase label="Account" facts={facts} invoiceRow={invoiceRow} />)

        expect(screen.getByText("150,000 ₫")).toBeInTheDocument()
        expect(screen.getByText("1 of 1")).toBeInTheDocument()
        expect(screen.getByText("Invoice INV-2026-0903")).toBeInTheDocument()
        expect(screen.getByText("Due soon")).toBeInTheDocument()
    })

    it("routes the invoice's own top-up action", () => {
        const onTopUp = vi.fn()
        render(<OverviewAccountBase label="Account" facts={facts} invoiceRow={{ ...invoiceRow, onTopUp }} />)

        fireEvent.click(screen.getByRole("button", { name: "Top up wallet" }))
        expect(onTopUp).toHaveBeenCalledTimes(1)
    })

    it("draws no invoice row when the account owes nothing", () => {
        render(<OverviewAccountBase label="Account" facts={facts} />)

        expect(screen.queryByRole("button", { name: "Top up wallet" })).not.toBeInTheDocument()
    })

    it("routes the label row's own transactions action", () => {
        const onOpenWallet = vi.fn()
        render(<OverviewAccountBase label="Account" actionLabel="See transactions" onOpenWallet={onOpenWallet} facts={facts} />)

        fireEvent.click(screen.getByRole("button", { name: "See transactions" }))
        expect(onOpenWallet).toHaveBeenCalledTimes(1)
    })

    it("marks the account unavailable when its own read was refused", () => {
        const { container } = render(<OverviewAccountBase label="Account" state="unavailable" facts={[]} />)

        expect(container.querySelector('[data-grammar-surface-card="true"]')).toBeInTheDocument()
        expect(container.querySelector('[data-grammar-state="unavailable"]')).toBeInTheDocument()
    })
})
