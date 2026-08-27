import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()
const location = { pathname: "/overview", locale: "vi" }

vi.mock("@/i18n/navigation", () => ({
    usePathname: () => location.pathname,
    useRouter: () => ({ push }),
}))
vi.mock("next-intl", () => ({
    useLocale: () => location.locale,
    useTranslations: () => (key: string) => key,
}))

import { ConsoleNav } from "."

describe("ConsoleNav", () => {
    beforeEach(() => push.mockClear())
    afterEach(() => {
        cleanup()
        location.pathname = "/overview"
        location.locale = "vi"
    })

    it("keeps the complete grouped destination set in the desktop rail", () => {
        render(<ConsoleNav />)

        expect(screen.queryByText("title")).not.toBeInTheDocument()
        expect(screen.getAllByRole("option")).toHaveLength(7)
        expect(screen.getByText("nav.servers")).toBeInTheDocument()
        expect(screen.getByText("nav.domains")).toBeInTheDocument()
        expect(screen.getByText("nav.support")).toBeInTheDocument()
        fireEvent.click(screen.getByText("nav.servers"))
        expect(push).not.toHaveBeenCalled()
    })

    it("collapses to the accessible icon destination presentation", async () => {
        const user = userEvent.setup()
        render(<ConsoleNav />)

        const glyphPath = screen.getByRole("button", { name: "closeMenu" }).querySelector("path")
        expect(glyphPath).toHaveAttribute(
            "d",
            "M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200Z",
        )
        await user.click(screen.getByRole("button", { name: "closeMenu" }))
        const expandedControl = screen.getByRole("button", { name: "openMenu" })
        expect(expandedControl).toHaveAttribute("aria-pressed", "true")
        expect(expandedControl.querySelector("path")).toHaveAttribute("d", glyphPath?.getAttribute("d"))
        const compactOverview = screen.getByRole("option", { name: "nav.overview" })
        expect(compactOverview.querySelector("[title='nav.overview']")).toBeInTheDocument()
    })

    it("keeps the complete destination set in the right-side mobile drawer", async () => {
        const user = userEvent.setup()
        render(<ConsoleNav mode="mobile" />)

        fireEvent.click(screen.getByRole("button", { name: "openMenu" }))
        expect(await screen.findAllByRole("option")).toHaveLength(7)
        expect(screen.getByText("nav.servers")).toBeInTheDocument()
        expect(screen.getByText("nav.domains")).toBeInTheDocument()
        expect(screen.getByText("nav.support")).toBeInTheDocument()
        await user.click(screen.getByRole("option", { name: "nav.wallet" }))
        expect(push).toHaveBeenCalledWith("/wallet")
    })

    it("normalizes the locale before marking and opening a destination", async () => {
        const user = userEvent.setup()
        location.pathname = "/apps/detail"
        location.locale = "en"
        render(<ConsoleNav mode="mobile" />)

        fireEvent.click(screen.getByRole("button", { name: "openMenu" }))
        expect(await screen.findByRole("option", { name: "nav.apps" })).toHaveAttribute("aria-selected", "true")
        await user.click(screen.getByRole("option", { name: "nav.agentos" }))
        expect(push).toHaveBeenCalledWith("/agentos")
    })

    it("treats the exact locale root as overview", async () => {
        location.pathname = "/"
        location.locale = "en"
        render(<ConsoleNav mode="mobile" />)

        fireEvent.click(screen.getByRole("button", { name: "openMenu" }))

        expect(await screen.findByRole("option", { name: "nav.overview" })).toHaveAttribute("aria-selected", "true")
    })
})
