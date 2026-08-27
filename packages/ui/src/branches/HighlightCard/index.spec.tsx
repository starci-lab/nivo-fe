import { render, screen } from "@testing-library/react"
import { describe, expect, expectTypeOf, it } from "vitest"
import { Text } from "../../leaves/Text"
import { defineContractComponent, defineLeafComponent } from "../../contracts/props"
import { HighlightCard, type HighlightCardProps } from "."

const content = defineContractComponent("identity-phase-action", {
    identity: defineContractComponent("subject-over-muted-caption", {
        subject: defineLeafComponent("text", {}, () => <Text props={{ content: "Order #42" }} />),
        caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: "Awaiting payment", size: "xs", tone: "muted" }} />),
    }),
    prompt: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: "Continue", size: "sm" }} />),
    body: defineLeafComponent("text", {}, () => <Text props={{ content: "Pay the linked invoice" }} />),
})

describe("HighlightCard", () => {
    it("renders only a contract-bound body inside its owned card and accent sweep", () => {
        render(<HighlightCard props={{ label: "Next step" }} contract="identity-phase-action" render={content} />)

        expect(screen.getByText("Pay the linked invoice")).toBeInTheDocument()
        expect(document.querySelector("[data-component='HighlightCardSweep']")).toBeInTheDocument()
        expect(screen.getByText("Next step")).toBeInTheDocument()
        const owner = document.querySelector("[data-grammar-surface-card]")
        const surface = owner?.querySelector("[data-grammar-surface]")
        expect(owner).toHaveAttribute("data-grammar-contract", "core.surface-card")
        expect(owner).not.toBe(surface)
        expect(owner?.querySelector("[data-grammar-surface-label]"))
            .toContainElement(screen.getByRole("heading", { name: "Next step" }))
        expect(surface).toHaveAttribute("data-grammar-frame", "bounded")
        expect(surface).toHaveAttribute("data-grammar-scroll", "page")
        expect(surface?.querySelector(":scope > [data-grammar-surface-content]"))
            .toContainElement(screen.getByText("Pay the linked invoice"))
    })

    it("removes the accent sweep while the contract body is loading", () => {
        render(<HighlightCard contract="identity-phase-action" render={content} isLoading />)
        expect(document.querySelector("[data-component='HighlightCardSweep']")).not.toBeInTheDocument()
        expect(document.querySelector("[data-grammar-surface]"))
            .toHaveAttribute("data-grammar-state", "pending")
    })

    it("does not expose a ReactNode body or children escape hatch", () => {
        type Props = HighlightCardProps<"identity-phase-action">

        expectTypeOf<Props>().not.toHaveProperty("body")
        expectTypeOf<Props>().not.toHaveProperty("children")
    })
})
