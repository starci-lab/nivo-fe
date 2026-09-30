import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SlotView } from "."

const LABELS = { empty: "Nothing", forbidden: "Denied", error: "Failed", retry: "Retry" }

const view = (slot: Parameters<typeof SlotView<ReadonlyArray<string>>>[0]["slot"]) =>
    render(
        <SlotView slot={slot} placeholder={["placeholder"]} labels={LABELS}>
            {(items, isSkeleton) => <span>{`${items.join(",")}:${String(isSkeleton)}`}</span>}
        </SlotView>,
    )

describe("SlotView", () => {
    it("draws the placeholder as a skeleton while loading", () => {
        view({ isLoading: true })
        expect(screen.getByText("placeholder:true")).toBeInTheDocument()
    })

    it("draws the ready tree with the items", () => {
        view({ items: ["a", "b"] })
        expect(screen.getByText("a,b:false")).toBeInTheDocument()
    })

    it("says the slot is empty for absent or empty items", () => {
        view({})
        expect(screen.getByText("Nothing")).toBeInTheDocument()
    })

    it("says the slot is empty for an empty list", () => {
        view({ items: [] })
        expect(screen.getByText("Nothing")).toBeInTheDocument()
    })
})
