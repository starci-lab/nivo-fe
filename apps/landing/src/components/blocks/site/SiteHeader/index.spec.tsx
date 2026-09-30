import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import en from "@/messages/en.json"
import { SiteHeader } from "./index"

const mount = () =>
    render(
        <NextIntlClientProvider locale="en" messages={en}>
            <SiteHeader />
        </NextIntlClientProvider>,
    )

describe("SiteHeader", () => {
    it("opens and closes the compact navigation with keyboard-safe state", async () => {
        const user = userEvent.setup()
        const view = mount()

        const trigger = screen.getByRole("button", { name: "Open navigation" })
        await expectNoA11yViolations(view.container)

        await user.click(trigger)
        expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toBeInTheDocument()
        expect(trigger).toHaveAttribute("aria-label", "Close navigation")

        await user.keyboard("{Escape}")
        expect(screen.queryByRole("navigation", { name: "Mobile navigation" })).not.toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Open navigation" })).toHaveFocus()
    })

    it("draws the navigation from the catalog with locale-prefixed addresses", () => {
        mount()

        expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument()
        expect(screen.getAllByRole("link", { name: "Solutions" })[0]).toHaveAttribute("href", "/en/applications")
    })

    it("hosts the theme menu beside the sign-in action, named from the catalog", () => {
        mount()

        expect(screen.getByRole("button", { name: en.site.theme.label })).toBeInTheDocument()
    })
})
