import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const push = vi.fn()
const location = { pathname: "/overview" }
vi.mock("@/i18n/navigation", () => ({ usePathname: () => location.pathname, useRouter: () => ({ push }) }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
import { Sidebar } from "."

describe("product Sidebar adapter", () => {
    beforeEach(() => push.mockClear())
    afterEach(cleanup)

    it("projects the complete destination registry through Grammar Sidebar", () => {
        render(<Sidebar />)
        expect(screen.getAllByRole("option")).toHaveLength(7)
        expect(screen.getByText("nav.servers")).toBeInTheDocument()
        fireEvent.click(screen.getByText("nav.servers"))
        expect(push).not.toHaveBeenCalled()
        fireEvent.click(screen.getByText("nav.wallet"))
        expect(push).toHaveBeenCalledWith("/wallet")
    })

    it("closes the mobile drawer only after a routable destination is activated", async () => {
        render(<Sidebar mode="mobile" />)
        fireEvent.click(screen.getByRole("button", { name: "openMenu" }))
        expect(await screen.findByRole("dialog")).toBeInTheDocument()

        fireEvent.click(screen.getByText("nav.wallet"))
        expect(push).toHaveBeenCalledWith("/wallet")
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
})
