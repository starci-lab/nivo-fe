import { render, screen, within } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { EcosystemPage, IdeaDetailPage, IdeasPage, TrustPage, getIdeaBySlug, normalizeContactIntent } from "."

describe("NIVO public exploration routes", () => {
    it("preserves the seven-stage Trust progression without invented security evidence", () => {
        const html = renderToStaticMarkup(<TrustPage />)
        const anchors = ["future-worth-earning", "trust-starts-small", "human-ai-governance", "evidence-before-scale", "transformation-journey", "what-becomes-possible", "truth-before-promise"]
        let previousIndex = -1
        for (const anchor of anchors) {
            const currentIndex = html.indexOf(`id="${anchor}"`)
            expect(currentIndex).toBeGreaterThan(previousIndex)
            previousIndex = currentIndex
        }
        expect(html).toContain("Autonomy must be earned")
        expect(html).not.toContain("enterprise-grade")
    })

    it("renders exactly the four canonical ecosystem actors", () => {
        render(<EcosystemPage />)
        const actors = within(screen.getByRole("list", { name: "Bốn actor của hệ sinh thái NIVO" }))
        expect(actors.getAllByRole("listitem")).toHaveLength(4)
        expect(actors.getByText("Customers")).toBeInTheDocument()
        expect(actors.getByText("Partners & Experts")).toBeInTheDocument()
        expect(actors.getByText("Institutions")).toBeInTheDocument()
        expect(actors.getByText("Future Builders")).toBeInTheDocument()
    })

    it("exposes Ideas types and puts the direct thesis before reasoning", () => {
        const idea = getIdeaBySlug("responsibility-before-agent")
        expect(idea).toBeDefined()
        if (idea === undefined) return
        const indexHtml = renderToStaticMarkup(<IdeasPage />)
        const articleHtml = renderToStaticMarkup(<IdeaDetailPage idea={idea} />)
        expect(indexHtml).toContain("Góc nhìn")
        expect(indexHtml).toContain("Framework")
        expect(indexHtml).toContain("NIVO đang xây")
        expect(articleHtml.indexOf(idea.thesis)).toBeLessThan(articleHtml.indexOf("Quan sát"))
        expect(articleHtml.match(/<h1/g)).toHaveLength(1)
    })

    it("uses NIVO icons instead of Unicode arrows across the exploration surfaces", () => {
        const idea = getIdeaBySlug("responsibility-before-agent")
        expect(idea).toBeDefined()
        if (idea === undefined) return

        const html = [<TrustPage key="trust" />, <EcosystemPage key="ecosystem" />, <IdeasPage key="ideas" />, <IdeaDetailPage idea={idea} key="detail" />]
            .map((page) => renderToStaticMarkup(page))
            .join("")

        expect(html).not.toMatch(new RegExp("[\\u2192\\u2193]", "u"))
        expect(html).toContain("data-component=\"Icon\"")
        expect(html).toContain("data-usage=\"chip\"")
    })

    it("accepts only the six public Contact intents, taking the first of a repeated query", () => {
        expect(normalizeContactIntent("partnership")).toBe("partnership")
        expect(normalizeContactIntent(["talent", "media"])).toBe("talent")
        expect(normalizeContactIntent("unknown")).toBeNull()
        expect(normalizeContactIntent(undefined)).toBeNull()
    })
})
