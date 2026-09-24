import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { SiteHeader } from "./SiteHeader"

describe("SiteHeader", () => {
    it("opens and closes the compact navigation with keyboard-safe state", async () => {
        const user = userEvent.setup()
        render(<SiteHeader />)

        const trigger = screen.getByRole("button", { name: "Mở điều hướng" })
        expect(trigger).toHaveAttribute("aria-expanded", "false")

        await user.click(trigger)
        expect(screen.getByRole("navigation", { name: "Điều hướng di động" })).toBeInTheDocument()
        expect(trigger).toHaveAttribute("aria-expanded", "true")

        await user.keyboard("{Escape}")
        expect(screen.queryByRole("navigation", { name: "Điều hướng di động" })).not.toBeInTheDocument()
        expect(trigger).toHaveFocus()
    })
})