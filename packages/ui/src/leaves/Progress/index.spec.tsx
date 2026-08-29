import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Progress } from "./"

describe("Progress", () => {
    it("exposes the named measurement and value", () => {
        render(<Progress props={{ label: "Course completion", value: 42 }} />)
        const progress = screen.getByRole("progressbar", { name: "Course completion" })
        expect(progress).toHaveAttribute("data-loading", "false")
        expect(progress).toHaveAttribute("aria-valuenow", "42")
    })

    it("renders an inert seam while loading", () => {
        render(<Progress props={{ label: "Course completion" }} isLoading />)
        const loading = document.querySelector("[data-loading='true']")
        expect(loading).toHaveAttribute("data-loading", "true")
        expect(loading).toHaveAttribute("aria-hidden", "true")
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
    })
})
