import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PricingPage } from "."

describe("PricingPage", () => {
    it("keeps the route-specific frame around the canonical pricing content", () => {
        const { container } = render(<PricingPage />)

        expect(container.querySelector('[data-product-page="pricing"]')).not.toBeNull()
    })
})
