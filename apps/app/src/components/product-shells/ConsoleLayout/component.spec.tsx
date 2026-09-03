import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/product-shells/Sidebar", () => ({
    Sidebar: () => <span>Overview</span>,
}))
vi.mock("@/components/product-shells/ConsoleTopBar", () => ({
    ConsoleTopBar: () => <header>Nivo</header>,
}))

import { ConsoleLayoutBase } from "./component"

const precedes = (first: Element, second: Element) => Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)

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
        expect(screen.getByRole("main", { name: "Console workspace" })).toHaveTextContent("Workspace body")
        expect(screen.getAllByRole("main")).toHaveLength(1)
        expect(screen.getAllByRole("navigation")).toHaveLength(1)
    })

    it("mounts the navigation band once, ahead of the workspace landmarks rather than inside them", () => {
        const RoutedBody = () => <p>Workspace body</p>

        render(<ConsoleLayoutBase
            body={RoutedBody}
            bodyProps={{}}
            navigationLabel="Console destinations"
            primaryLabel="Console workspace"
        />)

        const banners = screen.getAllByRole("banner")
        expect(banners).toHaveLength(1)
        const [band] = banners
        const rail = screen.getByRole("navigation", { name: "Console destinations" })
        const workspace = screen.getByRole("main", { name: "Console workspace" })
        expect(band.contains(rail)).toBe(false)
        expect(band.contains(workspace)).toBe(false)
        expect(rail.contains(band)).toBe(false)
        expect(workspace.contains(band)).toBe(false)
        expect(precedes(band, rail)).toBe(true)
        expect(precedes(band, workspace)).toBe(true)
    })
})
