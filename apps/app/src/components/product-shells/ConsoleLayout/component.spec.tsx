import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/product-shells/Sidebar", () => ({
    Sidebar: () => <span>Overview</span>,
}))
vi.mock("@/components/product-shells/ConsoleTopBar", () => ({
    ConsoleTopBar: () => <span>Nivo</span>,
}))

import { ConsoleLayoutBase } from "./component"

describe("ConsoleLayoutBase", () => {
    it("projects Nivo chrome into the shared workspace landmarks", () => {
        const RoutedBody = () => <p>Workspace body</p>

        render(<ConsoleLayoutBase
            body={RoutedBody}
            bodyProps={{}}
            navigationLabel="Console navigation"
            primaryLabel="Console"
        />)

        expect(screen.getByRole("banner")).toHaveTextContent("Nivo")
        expect(screen.getByRole("navigation", { name: "Console navigation" })).toHaveTextContent("Overview")
        const layout = screen.getByRole("navigation", { name: "Console navigation" }).parentElement
        expect(layout?.closest('[data-grammar-workspace-shell="true"]')).toBeInTheDocument()
        expect(layout).toHaveAttribute("data-grammar-workspace-navigation-track", "intrinsic")
        expect(layout).toHaveAttribute("data-grammar-workspace-navigation-visibility", "wide")
        expect(screen.getByRole("main", { name: "Console" })).toHaveTextContent("Workspace body")
        expect(screen.getAllByRole("main")).toHaveLength(1)
    })
})
