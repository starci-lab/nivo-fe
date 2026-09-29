import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SiteShell } from "./component"

describe("SiteShell", () => {
    it("mounts one shared skip-link, banner, routed content, and footer", () => {
        const { container } = render(
            <SiteShell skipLabel="Skip to main content">
                <main id="main-content">Route</main>
            </SiteShell>,
        )
        const html = container.innerHTML

        expect(html).toContain("Skip to main content")
        expect(html).toContain("Main navigation")
        expect(html).toContain("Human Leads. AI Operates. System Learns.")
    })

    it("points the skip link at the shared main landmark and keeps the banner and footer landmarks", () => {
        render(
            <SiteShell skipLabel="Skip to main content">
                <main id="main-content">Route</main>
            </SiteShell>,
        )

        expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute(
            "href",
            "#main-content",
        )
        expect(screen.getByRole("banner")).toBeInTheDocument()
        expect(screen.getByRole("contentinfo")).toBeInTheDocument()
    })
})
