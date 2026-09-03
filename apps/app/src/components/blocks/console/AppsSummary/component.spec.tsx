import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AppsSummaryBase, type AppsSummaryState } from "./component"

const item = { id: "app-1", name: "Store", detail: "store.example", statusLabel: "Ready", statusTone: "success" as const, actionLabel: "Open" }

describe("AppsSummaryBase", () => {
    it("draws owned application identity, lifecycle, and action without a total", () => {
        render(<AppsSummaryBase label="Apps" state={{ phase: "populated", items: [item] }} onOpenApp={vi.fn()} />)

        expect(screen.getAllByText("Store").length).toBeGreaterThan(0)
        expect(screen.getByText("store.example")).toBeInTheDocument()
        expect(screen.getByText("Ready")).toBeInTheDocument()
        expect(screen.queryByText(/total/i)).not.toBeInTheDocument()
    })

    it("gives repeated row actions an item-specific accessible name", () => {
        const onOpenApp = vi.fn()
        render(<AppsSummaryBase label="Apps" state={{ phase: "populated", items: [
            item,
            { ...item, id: "app-2", name: "Docs", detail: "docs.example" },
        ] }} onOpenApp={onOpenApp} />)

        fireEvent.click(screen.getByRole("button", { name: "Open Store" }))
        fireEvent.click(screen.getByRole("button", { name: "Open Docs" }))

        expect(screen.getAllByText("Open")).toHaveLength(2)
        expect(onOpenApp).toHaveBeenNthCalledWith(1, "app-1")
        expect(onOpenApp).toHaveBeenNthCalledWith(2, "app-2")
    })

    it("offers the whole collection only when the caller gave it a route", () => {
        const onOpenAll = vi.fn()
        render(<AppsSummaryBase label="Apps" openAllLabel="Open apps" state={{ phase: "populated", items: [item] }} onOpenApp={vi.fn()} onOpenAll={onOpenAll} />)

        fireEvent.click(screen.getByRole("button", { name: "Open apps" }))
        expect(onOpenAll).toHaveBeenCalledTimes(1)
    })

    it("renders every settled state without inventing a row", () => {
        const states: ReadonlyArray<AppsSummaryState> = [
            { phase: "pending" },
            { phase: "empty", message: "No apps yet" },
            { phase: "forbidden", message: "Access denied" },
            { phase: "populated", items: [item] },
        ]

        for (const state of states) {
            const view = render(<AppsSummaryBase label="Apps" state={state} onOpenApp={vi.fn()} />)
            expect(screen.getAllByText("Apps").length).toBeGreaterThan(0)
            view.unmount()
        }
    })

    it("keeps an empty and a forbidden answer local to the section", () => {
        const empty = render(<AppsSummaryBase label="Apps" state={{ phase: "empty", message: "No apps yet" }} onOpenApp={vi.fn()} />)
        expect(screen.getByText("No apps yet")).toBeInTheDocument()
        empty.unmount()

        render(<AppsSummaryBase label="Apps" state={{ phase: "forbidden", message: "Access denied" }} onOpenApp={vi.fn()} />)
        expect(screen.getByText("Access denied")).toBeInTheDocument()
    })
})
