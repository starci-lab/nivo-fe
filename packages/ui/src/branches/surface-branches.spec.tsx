import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PressableSurface } from "./PressableSurface"
import { SurfaceCard } from "./SurfaceCard"
import { Tree } from "./Tree"
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
    it("keeps runtime data in a ComponentType that opens the matching Tree", () => {
        type RuntimeBodyProps = { readonly content: string }
        const RuntimeBody = ({ content }: RuntimeBodyProps) => (
            <Tree
                contract="inline-action-run"
                render={defineContractComponent("inline-action-run", {
                    action: [defineLeafComponent("button", {}, () => <Text props={{ content }} />)],
                })}
            />
        )
        const runtimeBody = defineContractComponent("inline-action-run", RuntimeBody)

        render(<SurfaceCard contract="inline-action-run" render={runtimeBody} contentProps={{ content: "Runtime body" }} />)

        expect(screen.getByText("Runtime body")).toBeInTheDocument()
        expect(document.querySelector("[data-node='inline-action-run']")).toBeInTheDocument()
    })

    it("renders a frameless unnamed body without inventing a heading", () => {
        render(<SurfaceCard contract="inline-action-run" render={bodyNode} props={{ isFrameless: true }} />)
        expect(screen.getByText("Body")).toBeInTheDocument()
        expect(screen.queryByRole("heading")).not.toBeInTheDocument()
        expect(document.querySelector("[data-component='SurfaceCardBody']")).toBeInTheDocument()
        const owner = document.querySelector("[data-grammar-surface-card]")
        const surface = owner?.querySelector("[data-grammar-surface]")
        expect(owner).toHaveAttribute("data-grammar-frame", "frameless")
        expect(owner).not.toHaveAttribute("data-grammar-scroll")
        expect(surface).toHaveClass("starci-core-surface", "starci-core-frameless-surface")
        expect(surface).toHaveAttribute("data-grammar-frame", "frameless")
        expect(surface).toHaveAttribute("data-grammar-scroll", "page")
        const content = surface?.querySelector(":scope > [data-grammar-surface-content]")
        expect(content).toContainElement(screen.getByText("Body"))
    })

    it("keeps a supplied label inside the owner when the surface is frameless", () => {
        render(<SurfaceCard contract="inline-action-run" render={bodyNode} props={{ isFrameless: true, label: "Recent" }} />)
        const owner = document.querySelector("[data-grammar-surface-card]")
        expect(owner?.querySelector("[data-grammar-surface-label]"))
            .toContainElement(screen.getByRole("heading", { name: "Recent" }))
        expect(owner?.querySelector("[data-grammar-surface]"))
            .toContainElement(screen.getByText("Body"))
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

    it("declares the inherited Grammar Core surface contract on its owner", () => {
        render(<SurfaceCard contract="inline-action-run" render={bodyNode} />)
        const owner = document.querySelector("[data-grammar-surface-card]")
        expect(owner).toHaveAttribute("data-grammar-contract", "core.surface-card")
        expect(owner).toHaveAttribute("data-grammar-frame", "bounded")
        expect(owner).not.toHaveAttribute("data-grammar-scroll")
        const surface = owner?.querySelector("[data-grammar-surface]")
        expect(surface).toHaveAttribute("data-grammar-frame", "bounded")
        expect(surface).toHaveAttribute("data-grammar-scroll", "page")
        expect(surface).toHaveAttribute("data-grammar-state", "neutral")
    })
})
