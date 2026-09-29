import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { CardGrid } from "."

describe("CardGrid", () => {
    it("renders its card content in the selected grid", () => {
        render(
            <CardGrid variant="today" aria-label="Current work">
                <article>Current work item</article>
            </CardGrid>,
        )

        expect(screen.getByRole("article")).toHaveTextContent("Current work item")
    })
})
