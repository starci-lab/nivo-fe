import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"

const push = vi.fn()
const location = { pathname: "/overview" }
vi.mock("@/hooks", () => ({
    usePathname: () => location.pathname,
    usePersistedFlag: () => [false, vi.fn()],
    useRouter: () => ({ push }),
}))
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
        expect(options.map((option) => option.textContent)).toEqual(
            REGISTRY.map(([key]) => enMessages.console.nav[key]),
        )
        expect(screen.queryByText("Packages")).not.toBeInTheDocument()
        expect(screen.queryByText("Settings")).not.toBeInTheDocument()
        expect(screen.queryByRole("option", { name: "Packages" })).not.toBeInTheDocument()
        expect(screen.queryByRole("option", { name: "Settings" })).not.toBeInTheDocument()
    })

    it("routes every destination to its shell rev 17 target", () => {
        render(<Sidebar />)
        expect(screen.getByRole("option", { name: enMessages.console.nav.overview })).toHaveAttribute(
            "aria-selected",
            "true",
        )
        for (const [key, route] of REGISTRY.filter(([key]) => key !== "overview")) {
            push.mockClear()
            fireEvent.click(screen.getByText(enMessages.console.nav[key]))
            expect(push).toHaveBeenCalledWith(route)
        }
        cleanup()

        location.pathname = "/chat"
        render(<Sidebar />)
        fireEvent.click(screen.getByText(enMessages.console.nav.overview))
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
        fireEvent.click(screen.getByRole("button", { name: enMessages.console.openMenu }))
        const dialog = await screen.findByRole("dialog")
        expect(within(dialog).getAllByRole("option")).toHaveLength(5)
        expect(within(dialog).queryByText("Packages")).not.toBeInTheDocument()
        expect(within(dialog).queryByText("Settings")).not.toBeInTheDocument()
    })

    it("closes the mobile drawer only after a routable destination is activated", async () => {
        render(<Sidebar mode="mobile" />)
        fireEvent.click(screen.getByRole("button", { name: enMessages.console.openMenu }))
        const dialog = await screen.findByRole("dialog")

        fireEvent.click(within(dialog).getByText(enMessages.console.nav.wallet))
        expect(push).toHaveBeenCalledWith("/wallet")
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("preserves keyboard traversal and activation through the listbox", async () => {
        const user = userEvent.setup()
        render(<Sidebar />)
        await user.tab()
        await user.tab()
        expect(screen.getByRole("option", { name: enMessages.console.nav.overview })).toHaveFocus()
        await user.keyboard("{ArrowDown}")
        expect(screen.getByRole("option", { name: enMessages.console.nav.chat })).toHaveFocus()
        await user.keyboard("{Enter}")
        expect(push).toHaveBeenCalledWith("/chat")
    })
})
