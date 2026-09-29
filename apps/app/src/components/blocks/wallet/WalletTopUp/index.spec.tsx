import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { WalletTopUp } from "./index"
import type { PaymentResultView, TopUpView } from "@/modules/wallet/wallet-center/types"

const topUp: TopUpView = {
    overlayState: "open",
    title: "Top up wallet",
    closeLabel: "Close",
    amountLabel: "Amount",
    amountPlaceholder: "Enter amount",
    hint: "Minimum amount",
    submitLabel: "Continue",
    amount: "500000",
    pending: false,
    checkout: { reference: "REF-42", amount: "500,000 VND", note: "Redirecting" },
}

const result: PaymentResultView = {
    overlayState: "closed",
    title: "Payment result",
    closeLabel: "Close",
    state: "Pending",
    tone: "warning",
    amount: "500,000 VND",
    note: "Waiting for balance reconciliation",
    actionLabel: "Back to Wallet",
}

describe("WalletTopUp", () => {
    it("shows provider checkout evidence and closes the top-up overlay", () => {
        const closeTopUp = vi.fn()
        render(<WalletTopUp topUp={topUp} result={result} on={{ closeTopUp }} />)

        expect(screen.getByText("REF-42")).toBeInTheDocument()
        expect(screen.getByText("Redirecting")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Close", hidden: true }))
        expect(closeTopUp).toHaveBeenCalledTimes(1)
    })
})
