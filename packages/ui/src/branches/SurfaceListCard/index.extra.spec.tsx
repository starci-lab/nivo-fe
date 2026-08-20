import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SurfaceListCard } from "./"
import { defineContractComponent } from "../../contracts/props"

type ListProps = { readonly props: { readonly label: string, readonly description?: string } }
const content = defineContractComponent("question-answer-list", ({ props }: ListProps) => <span>{props.label}</span>)

describe("SurfaceListCard extra action branch", () => {
    it("keeps description when an action has no label", () => {
        render(<SurfaceListCard contract="question-answer-list" render={content} props={{ label: "FAQ", description: "Read the answers" }} />)
        expect(screen.getByText("Read the answers")).toBeInTheDocument()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })
})
