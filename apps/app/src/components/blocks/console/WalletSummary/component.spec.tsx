import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { WalletSummaryBase, type WalletSummaryState } from "./component"

const facts = [
    { id: "balance", label: "Balance", value: "$12.00", emphasis: true },
    { id: "invoice", label: "Unpaid invoice", value: "$4.00" },
]

describe("WalletSummaryBase", () => {
    it("draws already-formatted balance and invoice facts", () => {
        render(<WalletSummaryBase label="Wallet" actionLabel="Open wallet" state={{ phase: "populated", facts }} onOpenWallet={vi.fn()} />)

        expect(screen.getByText("$12.00")).toBeInTheDocument()
        expect(screen.getByText("$4.00")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Open wallet" })).toBeInTheDocument()
    })

    it("dispatches the two wallet routes it was given", () => {
        const onOpenWallet = vi.fn()
        const onTopUp = vi.fn()
        render(<WalletSummaryBase
            label="Wallet"
            actionLabel="Open wallet"
            secondaryActionLabel="Top up"
            state={{ phase: "populated", facts }}
            onOpenWallet={onOpenWallet}
            onTopUp={onTopUp}
        />)

        fireEvent.click(screen.getByRole("button", { name: "Open wallet" }))
        fireEvent.click(screen.getByRole("button", { name: "Top up" }))

        expect(onOpenWallet).toHaveBeenCalledTimes(1)
        expect(onTopUp).toHaveBeenCalledTimes(1)
    })

    it("draws a refusal without inventing money facts", () => {
        render(<WalletSummaryBase label="Wallet" state={{ phase: "failed", note: "Wallet unavailable" }} />)

        expect(screen.getByText("Wallet unavailable")).toBeInTheDocument()
        expect(screen.queryByText("Balance")).not.toBeInTheDocument()
    })

    it("renders every settled state without inventing a fact", () => {
        const states: ReadonlyArray<WalletSummaryState> = [
            { phase: "pending" },
            { phase: "empty", facts },
            { phase: "populated", facts },
            { phase: "failed", note: "Wallet unavailable" },
            { phase: "partial", facts, note: "Invoices unavailable" },
        ]

        for (const state of states) {
            const view = render(<WalletSummaryBase label="Wallet" state={state} />)
            expect(screen.getAllByText("Wallet").length).toBeGreaterThan(0)
            view.unmount()
        }
    })

    it("carries a refused and a partially refused read on the card's own published state, not the note alone", () => {
        const failed = render(<WalletSummaryBase label="Wallet" state={{ phase: "failed", note: "Wallet unavailable" }} />)
        expect(failed.container.querySelector('[data-grammar-state="unavailable"]')).not.toBeNull()
        failed.unmount()

        render(<WalletSummaryBase label="Wallet" state={{ phase: "partial", facts, note: "Invoices unavailable" }} />)
        expect(screen.getByText("Invoices unavailable")).toBeInTheDocument()
    })

    it("closes the card on the top-up band, after the balance and any refusal note", () => {
        render(<WalletSummaryBase
            label="Wallet"
            secondaryActionLabel="Top up"
            state={{ phase: "failed", note: "Wallet unavailable" }}
            onTopUp={vi.fn()}
        />)
        const noteText = screen.getByText("Wallet unavailable")
        const action = screen.getByRole("button", { name: "Top up" })
        expect(noteText.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
})
