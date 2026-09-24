import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { SiteShell } from "./SiteShell"

describe("SiteShell", () => {
    it("mounts one shared skip-link, banner, routed content, and footer", () => {
        const html = renderToStaticMarkup(<SiteShell><main id="main-content">Route</main></SiteShell>)

        expect(html).toContain("Bỏ qua đến nội dung chính")
        expect(html).toContain("Điều hướng chính")
        expect(html).toContain("Human Leads. AI Operates. System Learns.")
    })
})