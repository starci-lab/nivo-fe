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
})
