import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SurfaceFormCard } from "./SurfaceFormCard"
import { SurfaceListCard } from "./SurfaceListCard"
import { defineContractComponent, defineLeafComponent, type DataValue, type LeafProps } from "../contracts/props"
import type { SurfaceListCardActions } from "./SurfaceListCard"

type ListContentData = {
    readonly [key: string]: DataValue
    readonly label: string
    readonly description?: string
    readonly fact?: string
    readonly actionLabel?: string
    readonly isNested?: boolean
    readonly isLabelHidden?: boolean
}
type ListContentProps = LeafProps<ListContentData, SurfaceListCardActions>
const content = defineContractComponent("question-answer-list", ({ props }: ListContentProps) => (
    <div data-testid="list-content">{props.label} rows</div>
))
const label = defineLeafComponent("label", {}, () => null)
const field = defineLeafComponent("input", {}, () => null)
const submit = defineLeafComponent("button", {}, () => null)
const formContent = defineContractComponent("form-column", {
    field: [defineContractComponent("label-field-hint", { label, field })],
    submit,
})

describe("SurfaceFormCard", () => {
    it("keeps the contract node inside the bounded card", () => {
        render(<SurfaceFormCard ariaLabel="Form" contract="form-column" render={formContent} />)
        expect(document.querySelector("[data-component='SurfaceFormCard']")).toBeInTheDocument()
        expect(document.querySelector("[data-component='SurfaceFormCardBody']")).toBeInTheDocument()
        expect(document.querySelector("[data-node='form-column']")).toBeInTheDocument()
        expect(document.querySelector("[data-grammar-surface-card]"))
            .toHaveAttribute("data-grammar-contract", "core.surface-card")
        const owner = document.querySelector("[data-grammar-surface-card]")
        expect(owner).not.toHaveAttribute("data-grammar-scroll")
        expect(owner?.querySelector("[data-grammar-surface]"))
            .toHaveAttribute("data-grammar-scroll", "page")
    })
})

describe("SurfaceListCard", () => {
    it("shows a label, nested context, description, and content", () => {
        render(<SurfaceListCard contract="question-answer-list" render={content} props={{ label: "Questions", description: "Common answers", isNested: true }} />)
        expect(screen.getByRole("heading", { name: "Questions" })).toBeInTheDocument()
        expect(screen.getByText("Common answers")).toBeInTheDocument()
        expect(screen.getByTestId("list-content")).toHaveTextContent("Questions rows")
        expect(document.querySelector("[data-surface-context='nested']")).toBeInTheDocument()
        const owner = document.querySelector("[data-grammar-surface-list]")
        expect(owner).toHaveAttribute("data-grammar-contract", "core.surface-list-card")
        expect(owner).toHaveAttribute("data-grammar-list-mode", "interactive")
        expect(owner).not.toHaveAttribute("data-grammar-scroll")
        expect(owner?.querySelector("[data-grammar-surface]"))
            .toHaveAttribute("data-grammar-surface-depth", "nested")
        const collection = owner?.querySelector("[data-grammar-list]")
        expect(collection).toHaveClass("starci-core-owned-collection")
        expect(collection).toHaveAttribute("data-grammar-list-mode", "interactive")
    })

    it("prefers the action over description and hides an enclosing label", () => {
        const act = vi.fn()
        render(<SurfaceListCard contract="question-answer-list" render={content} props={{ label: "Questions", fact: "3", description: "Details", actionLabel: "View all", isLabelHidden: true }} on={{ act }} />)
        expect(screen.queryByRole("heading", { name: "Questions" })).not.toBeInTheDocument()
        expect(document.querySelector("[data-grammar-surface-list]"))
            .toHaveAttribute("data-grammar-label-visibility", "hidden")
        fireEvent.click(screen.getByRole("button", { name: "View all" }))
        expect(act).toHaveBeenCalledTimes(1)
        expect(screen.queryByText("Details")).not.toBeInTheDocument()
        expect(document.querySelector("[data-grammar-surface-footer]"))
            .toContainElement(screen.getByRole("button", { name: "View all" }))
        expect(document.querySelector("[data-grammar-surface-footer]"))
            .toHaveClass("starci-core-surface-footer")
    })
})
