import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ModalBranch } from "."

const PaymentForm = () => <p>Payment form</p>

describe("ModalBranch", () => {
    it("draws controlled content and reports dismissal", () => {
        const dismiss = vi.fn()
        render(<ModalBranch isOpen title="Top up" closeLabel="Close" content={PaymentForm} contentProps={{}} onDismiss={dismiss} />)
        expect(screen.getByText("Payment form")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Close" }))
        expect(dismiss).toHaveBeenCalledOnce()
    })
})