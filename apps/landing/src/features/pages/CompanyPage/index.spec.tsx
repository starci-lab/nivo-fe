import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import en from "@/messages/en.json"
import { CompanyPage } from "."

describe("CompanyPage", () => {
    it("renders the profile copy from the catalog", async () => {
        const { container } = render(<CompanyPage />)
        await expectNoA11yViolations(container)
        expect(container.textContent).toContain(en.company.hero.titleEmphasis)
        expect(container.textContent).toContain(en.company.leadership.badge)
        expect(container.querySelector(`[aria-label="${en.company.hero.visualLabel}"]`)).not.toBeNull()
    })

    it("routes its next paths through the localized site paths", () => {
        const { container } = render(<CompanyPage />)
        const nav = container.querySelector(`nav[aria-label="${en.company.next.label}"]`)
        const hrefs = Array.from(nav?.querySelectorAll("a") ?? []).map((anchor) => anchor.getAttribute("href"))
        expect(hrefs).toHaveLength(4)
        expect(
            hrefs.every(
                (href) =>
                    href?.endsWith("/nivo-os") ||
                    href?.endsWith("/ecosystem") ||
                    href?.endsWith("/contact") ||
                    href?.endsWith("/trust"),
            ),
        ).toBe(true)
    })
})
