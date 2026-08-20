import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SurfaceCard } from "./"
import { defineContractComponent, defineLeafComponent } from "../../contracts/props"
import { Text } from "../../leaves/Text"

const body = defineContractComponent("inline-action-run", {
    action: [defineLeafComponent("button", {}, () => <Text props={{ content: "Rows" }} />)],
})

describe("SurfaceCard fact-only label", () => {
    it("uses the baseline fact contract when no see-more action exists", () => {
        render(<SurfaceCard contract="inline-action-run" render={body} props={{ label: "Recent", fact: "3 items" }} />)
        expect(screen.getByRole("heading", { name: "Recent" })).toBeInTheDocument()
        expect(screen.getByText("3 items")).toBeInTheDocument()
        expect(screen.getByText("Rows")).toBeInTheDocument()
    })
})
