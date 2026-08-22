import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
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
        expect(document.querySelector("[data-component='HighlightCardBody']")).toBeInTheDocument()
        expect(document.querySelector("[data-component='HighlightCardSweep']")).toBeInTheDocument()
        expect(screen.getByText("Next step")).toBeInTheDocument()
    })

    it("removes the accent sweep while the contract body is loading", () => {
        render(<HighlightCard contract="identity-phase-action" render={content} isLoading />)
        expect(document.querySelector("[data-component='HighlightCardSweep']")).not.toBeInTheDocument()
    })

    it("does not expose a ReactNode body or children escape hatch", () => {
        type Props = HighlightCardProps<"identity-phase-action">
        type HasBody = "body" extends keyof Props ? true : false
        type HasChildren = "children" extends keyof Props ? true : false
        const hasBody: HasBody = false
        const hasChildren: HasChildren = false

        expect(hasBody).toBe(false)
        expect(hasChildren).toBe(false)
    })
})
