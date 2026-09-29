import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { RequestSummary } from "./"

describe("RequestSummary", () => {
    it("renders request details with an optional action", () => {
        const press = vi.fn()
        render(
            <RequestSummary
                props={{ subject: "Access request", detail: "Needs review", actionLabel: "Review" }}
                on={{ press }}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: "Review" }))
        expect(screen.getByText("Needs review")).toBeInTheDocument()
        expect(press).toHaveBeenCalledTimes(1)
    })
})
