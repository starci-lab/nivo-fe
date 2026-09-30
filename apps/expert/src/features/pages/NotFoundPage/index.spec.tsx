import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import en from "@/messages/en.json"
import { NotFoundPage } from "./"

describe("NotFoundPage", () => {
    it("leads back to the home page of the reader's locale", () => {
        render(<NotFoundPage />)
        expect(screen.getByText(en.boundary.notFound.message)).toBeInTheDocument()
        expect(screen.getByRole("link", { name: en.boundary.notFound.home })).toHaveAttribute("href", "/")
    })

    it("has no axe violations", async () => {
        const { container } = render(<NotFoundPage />)
        await expectNoA11yViolations(container)
    })
})
