import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CollapsibleRail } from "."

const STORAGE_KEY = "test:console-rail"

const ExpandedDestinations = () => <span>Expanded destinations</span>
const CompactDestinations = () => <span>Compact destinations</span>
const SidebarGlyph = () => <span aria-hidden="true" data-testid="sidebar-glyph">Sidebar icon</span>

const createStorage = (): Storage => {
    const values = new Map<string, string>()
    return {
        get length() {
            return values.size
        },
        clear: () => values.clear(),
        getItem: (key) => values.get(key) ?? null,
        key: (index) => [...values.keys()][index] ?? null,
        removeItem: (key) => values.delete(key),
        setItem: (key, value) => values.set(key, value),
    }
}

const renderRail = (onCollapsedChange = vi.fn(), title?: string) => {
    render(
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
            storageKey={STORAGE_KEY}
            onCollapsedChange={onCollapsedChange}
        />,
    )
    return onCollapsedChange
}

describe("CollapsibleRail", () => {
    beforeEach(() => {
        Object.defineProperty(globalThis, "localStorage", {
            configurable: true,
            value: createStorage(),
        })
    })

    it("keeps one host while toggling its accessible collapsed state and destination form", async () => {
        const onCollapsedChange = renderRail()
        const host = screen.getByRole("complementary", { name: "Console navigation" })
        const toggle = screen.getByRole("button", { name: "Collapse navigation" })
        const destinations = screen.getByText("Expanded destinations")

        expect(host).toHaveClass("collapsible-rail")
        expect(toggle).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByRole("heading", { name: "Console navigation", level: 2 }))
            .toBeInTheDocument()
        expect(host).toContainElement(destinations)
        expect(host.style.borderInlineEnd).toBe("1px solid var(--separator)")
        expect(host.style.padding).toBe("1.5rem")
        expect(screen.queryByText("Console")).not.toBeInTheDocument()
        expect(toggle).toHaveClass("rounded-full", "size-11")
        expect(toggle.style.background).toBe("")
        const glyph = screen.getByTestId("sidebar-glyph")
        expect(toggle.compareDocumentPosition(destinations) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
        expect(destinations).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }))

        expect(screen.getByRole("complementary", { name: "Console navigation" })).toBe(host)
        expect(screen.getByRole("button", { name: "Expand navigation" })).toHaveAttribute("aria-expanded", "false")
        expect(host.style.padding).toBe("1.5rem 0.625rem")
        expect(screen.getByTestId("sidebar-glyph")).toBe(glyph)
        expect(screen.getByText("Compact destinations")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Expand navigation" })).toBeInTheDocument()
        expect(localStorage.getItem(STORAGE_KEY)).toBe("true")
        expect(onCollapsedChange).toHaveBeenCalledWith(true)
    })

    it("renders a title only when the caller supplies evidenced copy", async () => {
        renderRail(vi.fn(), "Course progress")
        expect(screen.getByText("Course progress")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }))
        await waitFor(() => expect(screen.queryByText("Course progress")).not.toBeInTheDocument())
    })

    it("restores a persisted collapsed preference after mounting", async () => {
        localStorage.setItem(STORAGE_KEY, "true")
        renderRail()

        await waitFor(() => expect(
            screen.getByRole("button", { name: "Expand navigation" }),
        ).toBeInTheDocument())
        expect(screen.getByText("Compact destinations")).toBeInTheDocument()
    })

    it("remains operable when browser storage is unavailable", () => {
        const read = vi.spyOn(localStorage, "getItem").mockImplementation(() => {
            throw new DOMException("Blocked", "SecurityError")
        })
        renderRail()
        read.mockRestore()

        const write = vi.spyOn(localStorage, "setItem").mockImplementation(() => {
            throw new DOMException("Blocked", "SecurityError")
        })

        expect(() => fireEvent.click(
            screen.getByRole("button", { name: "Collapse navigation" }),
        )).not.toThrow()
        expect(screen.getByRole("button", { name: "Expand navigation" })).toBeInTheDocument()
        write.mockRestore()
    })
})
