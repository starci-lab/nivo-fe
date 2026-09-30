import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import en from "@/messages/en.json"
import { LoadingPage } from "./"

describe("LoadingPage", () => {
    it("announces the translated loading label", () => {
        render(<LoadingPage />)
        expect(screen.getByRole("status", { name: en.boundary.loading.label })).toBeInTheDocument()
    })

    it("has no axe violations", async () => {
        const { container } = render(<LoadingPage />)
        await expectNoA11yViolations(container)
    })
})
