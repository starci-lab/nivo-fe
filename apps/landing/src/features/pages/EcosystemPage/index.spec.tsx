import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import EcosystemPage from "."

describe("EcosystemPage", () => {
    it("renders exactly the four canonical ecosystem actors", async () => {
        const { container } = render(<EcosystemPage />)
        await expectNoA11yViolations(container)
        const actors = within(screen.getByRole("list", { name: "The four actors of the NIVO ecosystem" }))
        expect(actors.getAllByRole("listitem")).toHaveLength(4)
        expect(actors.getByText("Customers")).toBeInTheDocument()
        expect(actors.getByText("Partners & Experts")).toBeInTheDocument()
        expect(actors.getByText("Institutions")).toBeInTheDocument()
        expect(actors.getByText("Future Builders")).toBeInTheDocument()
    })
})
