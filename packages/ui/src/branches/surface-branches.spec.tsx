import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PressableSurface } from "./PressableSurface"
import { SurfaceCard } from "./SurfaceCard"
import { defineContractComponent, defineLeafComponent } from "../contracts/props"
import { Text } from "../leaves/Text"

const buttonNode = defineLeafComponent("button", {}, () => <Text props={{ content: "Body" }} />)
const bodyNode = defineContractComponent("inline-action-run", { action: [buttonNode] })

describe("PressableSurface", () => {
    it("reports a press and owns disabled busy semantics", () => {
        const press = vi.fn()
        const { rerender } = render(<PressableSurface contract="inline-action-run" render={bodyNode} label="Open body" hover="label" press={press} />)
        const button = screen.getByRole("button", { name: "Open body" })
        expect(button).toHaveAttribute("data-hover", "label")
        fireEvent.click(button)
        expect(press).toHaveBeenCalledTimes(1)
        rerender(<PressableSurface contract="inline-action-run" render={bodyNode} label="Open body" disabled />)
        expect(screen.getByRole("button", { name: "Open body" })).toBeDisabled()
        expect(screen.getByRole("button", { name: "Open body" })).toHaveAttribute("aria-busy", "true")
    })
})

describe("SurfaceCard", () => {
    it("renders a frameless unnamed body without inventing a heading", () => {
        render(<SurfaceCard contract="inline-action-run" render={bodyNode} props={{ isFrameless: true }} />)
        expect(screen.getByText("Body")).toBeInTheDocument()
        expect(screen.queryByRole("heading")).not.toBeInTheDocument()
        expect(document.querySelector("[data-component='SurfaceCardBody']")).not.toBeInTheDocument()
    })

    it("prioritizes see-more over a fact in the label line", () => {
        const seeMore = vi.fn()
        render(<SurfaceCard contract="inline-action-run" render={bodyNode} props={{ label: "Recent", fact: "12 items", seeMoreLabel: "See all" }} on={{ seeMore }} />)
        expect(screen.getByRole("heading", { name: "Recent" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /See all/ })).toBeInTheDocument()
        expect(screen.queryByText("12 items")).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("link", { name: /See all/ }))
        expect(seeMore).toHaveBeenCalledTimes(1)
    })
})
