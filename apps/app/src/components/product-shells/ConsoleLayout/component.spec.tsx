import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/product-shells/Sidebar", () => ({
    Sidebar: () => <span>Overview</span>,
}))
vi.mock("@/components/product-shells/ConsoleTopBar", () => ({
    ConsoleTopBar: () => <header>Nivo</header>,
}))

import { ConsoleLayoutBase } from "./component"

describe("ConsoleLayoutBase", () => {
    it("projects Nivo chrome into the shared workspace landmarks", () => {
        const RoutedBody = () => <p>Workspace body</p>

        render(<ConsoleLayoutBase
            body={RoutedBody}
            bodyProps={{}}
            navigationLabel="Console destinations"
            primaryLabel="Console workspace"
        />)

        expect(screen.getByRole("banner")).toHaveTextContent("Nivo")
        expect(screen.getByRole("navigation", { name: "Console destinations" })).toHaveTextContent("Overview")
        const layout = screen.getByRole("navigation", { name: "Console destinations" }).parentElement
        expect(layout?.closest('[data-grammar-workspace-shell="true"]')).toBeInTheDocument()
        expect(layout).toHaveAttribute("data-grammar-workspace-navigation-track", "intrinsic")
        expect(layout).toHaveAttribute("data-grammar-workspace-navigation-visibility", "wide")
        expect(screen.getByRole("main", { name: "Console workspace" })).toHaveTextContent("Workspace body")
        expect(screen.getAllByRole("main")).toHaveLength(1)
    })

    it("mounts the navigation band once, above the workspace shell rather than inside its header slot", () => {
        const RoutedBody = () => <p>Workspace body</p>

        const { container } = render(<ConsoleLayoutBase
            body={RoutedBody}
            bodyProps={{}}
            navigationLabel="Console destinations"
            primaryLabel="Console workspace"
        />)

        const banners = screen.getAllByRole("banner")
        expect(banners).toHaveLength(1)
        const shell = container.querySelector('[data-grammar-workspace-shell="true"]')
        expect(shell).not.toBeNull()
        expect(shell?.contains(banners[0])).toBe(false)
        expect(shell?.querySelector('[data-grammar-workspace-header="true"]')).toBeNull()
        const bandBeforeShell = Boolean(banners[0].compareDocumentPosition(shell as Node) & Node.DOCUMENT_POSITION_FOLLOWING)
        expect(bandBeforeShell).toBe(true)
    })
})
