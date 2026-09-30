import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { PricingPage } from "."

describe("PricingPage", () => {
    it("keeps the route-specific frame around the canonical pricing content", async () => {
        const { container } = render(<PricingPage />)
        await expectNoA11yViolations(container)

        expect(container.querySelector('[data-product-page="pricing"]')).not.toBeNull()
    })
})
