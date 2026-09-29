import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { SiteHeader } from "./index"

describe("SiteHeader", () => {
    it("opens and closes the compact navigation with keyboard-safe state", async () => {
        const user = userEvent.setup()
        render(<SiteHeader />)

        const trigger = screen.getByRole("button", { name: "Open navigation" })
        expect(trigger).toHaveAttribute("aria-expanded", "false")

        await user.click(trigger)
        expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toBeInTheDocument()
        expect(trigger).toHaveAttribute("aria-expanded", "true")

        await user.keyboard("{Escape}")
        expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).not.toBeInTheDocument()
        expect(trigger).toHaveFocus()
    })

    it("draws the navigation from the catalog with locale-prefixed addresses", () => {
        render(<SiteHeader />)

        expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument()
        expect(screen.getAllByRole("link", { name: "Solutions" })[0]).toHaveAttribute("href", "/en/applications")
    })
})
