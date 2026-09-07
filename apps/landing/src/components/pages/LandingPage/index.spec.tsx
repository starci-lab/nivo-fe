import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { LANDING_DESCRIPTION } from "@/resources/copy"
import { LandingPage } from "."

describe("LandingPage", () => {
    it("renders the shared Nivo brand and public description", () => {
        const html = renderToStaticMarkup(<LandingPage />)
        expect(html).toContain('aria-label="nivo"')
        expect(html).toContain(LANDING_DESCRIPTION)
    })

    it("keeps generated handoff artwork independently composable", () => {
        const html = renderToStaticMarkup(<LandingPage />)
        expect(html).toContain("nivo-unicorn-responsibility-transparent-v4.png")
        expect(html).toContain("handoff-human-v1.png")
        expect(html).toContain("handoff-ai-v1.png")
        expect(html).toContain("handoff-system-v1.png")
        expect(html).not.toContain("responsibility-handoff-v1.png")
    })
})
