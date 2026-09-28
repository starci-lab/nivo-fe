import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type MockSidebarProps = { readonly mode?: string }
vi.mock("@/features/layouts/Sidebar", () => ({
    Sidebar: ({ mode }: MockSidebarProps) => <span data-sidebar-mode={mode ?? "desktop"}>Overview</span>,
}))
vi.mock("@/features/layouts/ConsoleTopBar", () => ({
    ConsoleTopBar: () => <header>Nivo</header>,
}))

import { ConsoleLayoutBase } from "./component"

const precedes = (first: Element, second: Element) => Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)

describe("ConsoleLayoutBase", () => {
    it("projects Nivo chrome into the shared workspace landmarks", () => {
        const RoutedBody = () => <p>Workspace body</p>

        render(<ConsoleLayoutBase
            state={{ body: RoutedBody, bodyProps: {} }}
            props={{ navigationLabel: "Console destinations", primaryLabel: "Console workspace" }}
        />)

        expect(screen.getByRole("banner")).toHaveTextContent("Nivo")
        const navigations = screen.getAllByRole("navigation", { name: "Console destinations" })
        expect(navigations).toHaveLength(2)
        expect(navigations[0]).toHaveTextContent("Overview")
        expect(navigations[1]).toHaveTextContent("Overview")
        expect(screen.getByRole("main", { name: "Console workspace" })).toHaveTextContent("Workspace body")
        expect(screen.getAllByRole("main")).toHaveLength(1)
        expect(screen.getAllByRole("navigation")).toHaveLength(2)
    })

    it("gives every band exactly one navigation owner: rail for the shell, drawer for the compact band", () => {
        const RoutedBody = () => <p>Workspace body</p>

        render(<ConsoleLayoutBase
            state={{ body: RoutedBody, bodyProps: {} }}
            props={{ navigationLabel: "Console destinations", primaryLabel: "Console workspace" }}
        />)

        const rail = document.querySelector("[data-grammar-workspace-navigation-region]")
        const compact = document.querySelector("[data-grammar-workspace-compact-navigation]")
        expect(rail).not.toBeNull()
        expect(compact).not.toBeNull()
        expect(rail?.getAttribute("aria-label")).toBe("Console destinations")
        expect(compact?.getAttribute("aria-label")).toBe("Console destinations")
        expect(rail?.querySelector('[data-sidebar-mode="desktop"]')).not.toBeNull()
        expect(compact?.querySelector('[data-sidebar-mode="mobile"]')).not.toBeNull()
        expect(rail?.querySelector('[data-sidebar-mode="mobile"]')).toBeNull()
        expect(compact?.querySelector('[data-sidebar-mode="desktop"]')).toBeNull()
    })

    it("mounts the navigation band once, ahead of the workspace landmarks rather than inside them", () => {
        const RoutedBody = () => <p>Workspace body</p>

        render(<ConsoleLayoutBase
            state={{ body: RoutedBody, bodyProps: {} }}
            props={{ navigationLabel: "Console destinations", primaryLabel: "Console workspace" }}
        />)

        const banners = screen.getAllByRole("banner")
        expect(banners).toHaveLength(1)
        const [band] = banners
        const navigations = screen.getAllByRole("navigation", { name: "Console destinations" })
        const workspace = screen.getByRole("main", { name: "Console workspace" })
        for (const navigation of navigations) {
            expect(band.contains(navigation)).toBe(false)
            expect(navigation.contains(band)).toBe(false)
            expect(precedes(band, navigation)).toBe(true)
        }
        expect(band.contains(workspace)).toBe(false)
        expect(workspace.contains(band)).toBe(false)
        expect(precedes(band, workspace)).toBe(true)
    })
})
