import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { WalletBalance } from "./index"

describe("WalletBalance", () => {
    it("shows settled facts and sends the top-up action to its owner", () => {
        const topUp = vi.fn()
        render(
            <WalletBalance
                balance={{
                    phase: "answered",
                    label: "Available balance",
                    actionLabel: "Top up",
                    facts: [{ id: "balance", label: "Balance", value: "500,000 VND" }],
                }}
                on={{ topUp }}
            />,
        )

        expect(screen.getByText("500,000 VND")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Top up" }))
        expect(topUp).toHaveBeenCalledTimes(1)
    })
})
