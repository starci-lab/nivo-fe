import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CollapsibleRail } from "."

const ExpandedDestinations = () => <span>Expanded destinations</span>
const CompactDestinations = () => <span>Compact destinations</span>
const SidebarGlyph = () => (
    <span aria-hidden="true" data-testid="sidebar-glyph">
        Sidebar icon
    </span>
)

const renderRail = (collapsed = false, title?: string) => {
    const onCollapsedChange = vi.fn()
    const view = render(
        <CollapsibleRail
            ariaLabel="Console navigation"
            title={title}
            rail={ExpandedDestinations}
            railProps={{}}
            collapsedRail={CompactDestinations}
            collapsedRailProps={{}}
            toggleControl={SidebarGlyph}
            toggleControlProps={{}}
            collapseLabel="Collapse navigation"
            expandLabel="Expand navigation"
            collapsed={collapsed}
            onCollapsedChange={onCollapsedChange}
        />,
    )
    return { onCollapsedChange, view }
}

describe("CollapsibleRail", () => {
    it("draws the expanded rail and asks the caller to collapse it", () => {
        const { onCollapsedChange } = renderRail(false)
        const host = screen.getByRole("complementary", { name: "Console navigation" })
        const destinations = screen.getByText("Expanded destinations")

        expect(screen.getByRole("heading", { name: "Console navigation", level: 2 })).toBeInTheDocument()
        expect(host).toContainElement(destinations)
        expect(host.style.flexDirection).toBe("column")
        expect(host.style.padding).toBe("1.5rem")
        expect(screen.queryByText("Console")).not.toBeInTheDocument()
        expect(screen.getByTestId("sidebar-glyph")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }))

        expect(onCollapsedChange).toHaveBeenCalledExactlyOnceWith(true)
        expect(screen.getByText("Expanded destinations")).toBeInTheDocument()
    })

    it("draws the compact rail on the same host when the caller passes collapsed", () => {
        const { onCollapsedChange, view } = renderRail(false)
        const host = screen.getByRole("complementary", { name: "Console navigation" })
        const glyph = screen.getByTestId("sidebar-glyph")

        view.rerender(
            <CollapsibleRail
                ariaLabel="Console navigation"
                rail={ExpandedDestinations}
                railProps={{}}
                collapsedRail={CompactDestinations}
                collapsedRailProps={{}}
                toggleControl={SidebarGlyph}
                toggleControlProps={{}}
                collapseLabel="Collapse navigation"
                expandLabel="Expand navigation"
                collapsed
                onCollapsedChange={onCollapsedChange}
            />,
        )

        expect(screen.getByRole("complementary", { name: "Console navigation" })).toBe(host)
        expect(host.style.padding).toBe("1.5rem 0.625rem")
        expect(screen.getByTestId("sidebar-glyph")).toBe(glyph)
        expect(screen.getByText("Compact destinations")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Expand navigation" }))
        expect(onCollapsedChange).toHaveBeenCalledExactlyOnceWith(false)
    })

    it("renders a title only while expanded and only when the caller supplies evidenced copy", () => {
        const { view } = renderRail(false, "Course progress")
        expect(screen.getByText("Course progress")).toBeInTheDocument()

        view.rerender(
            <CollapsibleRail
                ariaLabel="Console navigation"
                title="Course progress"
                rail={ExpandedDestinations}
                railProps={{}}
                collapsedRail={CompactDestinations}
                collapsedRailProps={{}}
                toggleControl={SidebarGlyph}
                toggleControlProps={{}}
                collapseLabel="Collapse navigation"
                expandLabel="Expand navigation"
                collapsed
                onCollapsedChange={vi.fn()}
            />,
        )
        expect(screen.queryByText("Course progress")).not.toBeInTheDocument()
    })

    it("can defer landmark ownership to a surrounding navigation", () => {
        render(
            <CollapsibleRail
                ariaLabel="Console navigation"
                landmark="none"
                rail={ExpandedDestinations}
                railProps={{}}
                collapsedRail={CompactDestinations}
                collapsedRailProps={{}}
                toggleControl={SidebarGlyph}
                toggleControlProps={{}}
                collapseLabel="Collapse navigation"
                expandLabel="Expand navigation"
                collapsed={false}
                onCollapsedChange={vi.fn()}
            />,
        )

        expect(screen.queryByRole("complementary")).not.toBeInTheDocument()
        expect(screen.getByText("Expanded destinations").closest('[class~="md:flex"]')).toBeInTheDocument()
    })
})
