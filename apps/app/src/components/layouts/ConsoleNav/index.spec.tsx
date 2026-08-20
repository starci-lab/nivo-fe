import { cleanup, fireEvent, render, screen } from "@testing-library/react"
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

        expect(screen.getAllByRole("link")).toHaveLength(7)
        expect(screen.getByText("nav.servers")).toBeInTheDocument()
        expect(screen.getByText("nav.domains")).toBeInTheDocument()
        expect(screen.getByText("nav.support")).toBeInTheDocument()
        fireEvent.click(screen.getByText("nav.servers"))
        expect(push).not.toHaveBeenCalled()
    })

    it("keeps only the four real routes in the mobile tab bar", () => {
        render(<ConsoleNav mode="mobile" />)

        expect(screen.getAllByRole("link")).toHaveLength(4)
        expect(screen.queryByText("nav.servers")).not.toBeInTheDocument()
        expect(screen.queryByText("nav.domains")).not.toBeInTheDocument()
        expect(screen.queryByText("nav.support")).not.toBeInTheDocument()
        fireEvent.click(screen.getByText("nav.wallet"))
        expect(push).toHaveBeenCalledWith("/wallet")
    })

    it("normalizes the locale before marking and opening a destination", () => {
        location.pathname = "/en/apps/detail"
        location.locale = "en"
        render(<ConsoleNav mode="mobile" />)

        expect(screen.getByText("nav.apps")).toHaveAttribute("aria-current", "page")
        fireEvent.click(screen.getByText("nav.agentos"))
        expect(push).toHaveBeenCalledWith("/en/agentos")
    })
})
