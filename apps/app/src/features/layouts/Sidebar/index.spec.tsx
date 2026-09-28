import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"

const push = vi.fn()
const location = { pathname: "/overview" }
vi.mock("@/hooks", () => ({ usePathname: () => location.pathname, useRouter: () => ({ push }) }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
import { Sidebar } from "."

/** The owner-ruled console registry: key -> route, in rail order. */
const REGISTRY = [
    ["overview", "/overview"],
    ["chat", "/chat"],
    ["agentos", "/agentos"],
    ["apps", "/apps"],
    ["wallet", "/wallet"],
] as const

describe("Sidebar", () => {
    beforeEach(() => push.mockClear())
    afterEach(cleanup)

    it("projects exactly the shell rev 17 destinations through Grammar Sidebar", () => {
        render(<Sidebar />)
        const options = screen.getAllByRole("option")
        expect(options.map((option) => option.textContent)).toEqual(REGISTRY.map(([key]) => `nav.${key}`))
        expect(screen.queryByText("nav.packages")).not.toBeInTheDocument()
        expect(screen.queryByText("nav.settings")).not.toBeInTheDocument()
        expect(screen.queryByRole("option", { name: "nav.packages" })).not.toBeInTheDocument()
        expect(screen.queryByRole("option", { name: "nav.settings" })).not.toBeInTheDocument()
    })

    it("routes every destination to its shell rev 17 target", () => {
        render(<Sidebar />)
        expect(screen.getByRole("option", { name: "nav.overview" })).toHaveAttribute("aria-selected", "true")
        for (const [key, route] of REGISTRY.filter(([key]) => key !== "overview")) {
            push.mockClear()
            fireEvent.click(screen.getByText(`nav.${key}`))
            expect(push).toHaveBeenCalledWith(route)
        }
        cleanup()

        location.pathname = "/chat"
        render(<Sidebar />)
        fireEvent.click(screen.getByText("nav.overview"))
        expect(push).toHaveBeenCalledWith("/overview")
        location.pathname = "/overview"
    })

    it("binds the exact shell rev 17 vi and en labels in the real catalogs", () => {
        expect(viMessages.console.nav).toEqual({
            overview: "Tổng quan",
            chat: "Trò chuyện",
            agentos: "AgentOS",
            apps: "Ứng dụng",
            wallet: "Ví",
        })
        expect(enMessages.console.nav).toEqual({
            overview: "Overview",
            chat: "Chat",
            agentos: "AgentOS",
            apps: "Apps",
            wallet: "Wallet",
        })
    })

    it("keeps packages and the route-less settings item out of the mobile drawer too", async () => {
        render(<Sidebar mode="mobile" />)
        fireEvent.click(screen.getByRole("button", { name: "openMenu" }))
        const dialog = await screen.findByRole("dialog")
        expect(within(dialog).getAllByRole("option")).toHaveLength(5)
        expect(within(dialog).queryByText("nav.packages")).not.toBeInTheDocument()
        expect(within(dialog).queryByText("nav.settings")).not.toBeInTheDocument()
    })

    it("closes the mobile drawer only after a routable destination is activated", async () => {
        render(<Sidebar mode="mobile" />)
        fireEvent.click(screen.getByRole("button", { name: "openMenu" }))
        const dialog = await screen.findByRole("dialog")

        fireEvent.click(within(dialog).getByText("nav.wallet"))
        expect(push).toHaveBeenCalledWith("/wallet")
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("preserves keyboard traversal and activation through the listbox", async () => {
        const user = userEvent.setup()
        render(<Sidebar />)
        await user.tab()
        await user.tab()
        expect(screen.getByRole("option", { name: "nav.overview" })).toHaveFocus()
        await user.keyboard("{ArrowDown}")
        expect(screen.getByRole("option", { name: "nav.chat" })).toHaveFocus()
        await user.keyboard("{Enter}")
        expect(push).toHaveBeenCalledWith("/chat")
    })
})
