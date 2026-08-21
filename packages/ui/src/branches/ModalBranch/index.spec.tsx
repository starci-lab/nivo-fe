import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ModalBranch } from "."

describe("ModalBranch", () => {
    it("draws controlled content and reports dismissal", () => {
        const dismiss = vi.fn()
        render(<ModalBranch isOpen title="Top up" closeLabel="Close" content={<p>Payment form</p>} onDismiss={dismiss} />)
        expect(screen.getByText("Payment form")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Close" }))
        expect(dismiss).toHaveBeenCalledOnce()
    })
})
