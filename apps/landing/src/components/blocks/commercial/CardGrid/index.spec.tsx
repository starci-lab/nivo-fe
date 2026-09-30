import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { CardGrid } from "."

describe("CardGrid", () => {
    it("renders its card content in the selected grid", async () => {
        const { container } = render(
            <CardGrid variant="today" aria-label="Current work">
                <article>Current work item</article>
            </CardGrid>,
        )

        await expectNoA11yViolations(container)
        expect(screen.getByRole("article")).toHaveTextContent("Current work item")
    })
})
