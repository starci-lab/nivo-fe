/** @vitest-environment jsdom */
import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HorizontalScrollRegion, SurfaceCard } from "@starci/grammar/common"

/**
 * Consumer regression for the three Grammar-owned claims the Playwright audit of the AgentOS
 * workspace control centre measured failing on the family's own render (session 20260905-074125,
 * step-12/parallel-2): OVERFLOW-2 and PADDING-4 stamped on a frameless SurfaceCard body that owns
 * its boundaries and takes no inset, and OVERFLOW-3 on a HorizontalScrollRegion that stamped no
 * overflow answer. @starci/grammar 0.4.11 repairs them at the stamp; this spec reads the stamp off
 * the markup, so it fails at 0.4.9 (the audited defect) and passes at 0.4.11.
 */
describe("GrammarFamilyOverflow", () => {
    it("preserves the horizontal scroll affordance with the supported Grammar API", () => {
        const { container } = render(
            <HorizontalScrollRegion>
                <span>a wide row of tabs</span>
            </HorizontalScrollRegion>,
        )
        const region = container.querySelector(".starci-core-horizontal-scroll-region")
        expect(region).not.toBeNull()
        expect(region?.getAttribute("data-orientation")).toBe("horizontal")
        expect(region?.textContent).toContain("a wide row of tabs")
    })

    it("a frameless SurfaceCard body claims OVERFLOW-1 alone, not a double overflow", () => {
        const { container } = render(
            <SurfaceCard frame="frameless" ariaLabel="repair">
                <span>body</span>
            </SurfaceCard>,
        )
        const contracts = Array.from(container.querySelectorAll("[data-contract]")).map(
            (n) => n.getAttribute("data-contract") ?? "",
        )
        const overflowBody = contracts.find((c) => /\bOVERFLOW-1\b/.test(c))
        expect(overflowBody, `no OVERFLOW-1 body among ${JSON.stringify(contracts)}`).toBeTruthy()
        expect(overflowBody, "the frameless body still claims OVERFLOW-2 beside OVERFLOW-1").not.toMatch(/\bOVERFLOW-2\b/)
    })
})
