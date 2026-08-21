import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CollapsibleRail } from "."

const STORAGE_KEY = "test:console-rail"

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

const renderRail = (onCollapsedChange = vi.fn()) => {
    render(
        <CollapsibleRail
            ariaLabel="Console navigation"
            rail={<span>Expanded destinations</span>}
            collapsedRail={<span>Compact destinations</span>}
            collapseControl={<span aria-hidden="true">Collapse icon</span>}
            expandControl={<span aria-hidden="true">Expand icon</span>}
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

    it("keeps one host while toggling its accessible collapsed state and destination form", () => {
        const onCollapsedChange = renderRail()
        const host = screen.getByRole("complementary", { name: "Console navigation" })

        expect(host).toHaveAttribute("data-collapsed", "false")
        expect(screen.getByText("Expanded destinations")).toBeInTheDocument()

        fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }))

        expect(screen.getByRole("complementary", { name: "Console navigation" })).toBe(host)
        expect(host).toHaveAttribute("data-collapsed", "true")
        expect(screen.getByText("Compact destinations")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Expand navigation" })).toHaveAttribute("aria-pressed", "true")
        expect(localStorage.getItem(STORAGE_KEY)).toBe("true")
        expect(onCollapsedChange).toHaveBeenCalledWith(true)
    })

    it("restores a persisted collapsed preference after mounting", async () => {
        localStorage.setItem(STORAGE_KEY, "true")
        renderRail()

        await waitFor(() => expect(
            screen.getByRole("complementary", { name: "Console navigation" }),
        ).toHaveAttribute("data-collapsed", "true"))
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
        expect(screen.getByRole("complementary", { name: "Console navigation" })).toHaveAttribute(
            "data-collapsed",
            "true",
        )
        write.mockRestore()
    })
})
