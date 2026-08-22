import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Button } from "./"

describe("Button", () => {
    it("maps its semantic data to an enabled control", () => {
        render(<Button props={{ label: "Save", variant: "primary", size: "sm", type: "submit" }} />)
        const control = screen.getByRole("button", { name: "Save" })
        expect(control).toHaveAttribute("data-variant", "primary")
        expect(control).toHaveAttribute("data-size", "sm")
        expect(control).toHaveAttribute("type", "submit")
        expect(control).not.toBeDisabled()
    })

    it("disables and hides the label while an action is pending", () => {
        render(<Button props={{ label: "Publish", isPending: true }} on={{ press: vi.fn() }} />)
        const control = screen.getByRole("button", { name: "Publish" })
        expect(control).toBeDisabled()
        expect(control).toHaveAttribute("data-size", "md")
        expect(control).toHaveAttribute("data-action-pending", "true")
        expect(screen.getByText("Publish")).toHaveClass("invisible")
    })

    it("keeps the control disabled and paints a loading state", () => {
        render(<Button props={{ label: "Load" }} isLoading />)
        const control = screen.getByRole("button")
        expect(control).toBeDisabled()
        expect(control).toHaveAttribute("data-loading", "true")
    })

    it("opts a page-root action into the large control size", () => {
        render(<Button props={{ label: "Build an app", variant: "primary", size: "lg" }} />)
        expect(screen.getByRole("button", { name: "Build an app" })).toHaveAttribute("data-size", "lg")
    })
})
