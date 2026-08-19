import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SurfaceListCard } from "./SurfaceListCard"
import { defineContractComponent } from "../contracts/props"

type ListContentProps = { readonly props: { readonly label: string, readonly description?: string, readonly actionLabel?: string } }
const content = defineContractComponent("question-answer-list", ({ props }: ListContentProps) => <div>{props.label}</div>)

describe("SurfaceListCard loading action", () => {
    it("keeps the action slot visible while loading without an owner", () => {
        render(<SurfaceListCard contract="question-answer-list" render={content} props={{ label: "Questions", description: "Loading", actionLabel: "View all" }} isLoading />)
        expect(screen.getByRole("button", { name: "View all" })).toBeDisabled()
        expect(screen.queryByText("Loading")).not.toBeInTheDocument()
    })
})
