import { expectNoA11yViolations } from "@/testing/axe"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AppsDashboardRestingRows } from "."

describe("AppsDashboardRestingRows", () => {
    it("preserves the requested skeleton row count", async () => {
        const { container } = render(<AppsDashboardRestingRows indexes={[1, 2, 3]} />)
        expect(screen.getAllByRole("link")).toHaveLength(3)
        await expectNoA11yViolations(container)
    })
})
