import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()
const location = { pathname: "/overview", locale: "vi" }

vi.mock("next/navigation", () => ({
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

        expect(screen.getAllByRole("option")).toHaveLength(7)
        expect(screen.getByText("nav.servers")).toBeInTheDocument()
        expect(screen.getByText("nav.domains")).toBeInTheDocument()
        expect(screen.getByText("nav.support")).toBeInTheDocument()
        fireEvent.click(screen.getByText("nav.servers"))
        expect(push).not.toHaveBeenCalled()
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
        location.pathname = "/en/apps/detail"
        location.locale = "en"
        render(<ConsoleNav mode="mobile" />)

        fireEvent.click(screen.getByRole("button", { name: "openMenu" }))
        expect(await screen.findByRole("option", { name: "nav.apps" })).toHaveAttribute("aria-selected", "true")
        await user.click(screen.getByRole("option", { name: "nav.agentos" }))
        expect(push).toHaveBeenCalledWith("/en/agentos")
    })
})
