import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import en from "@/messages/en.json"
import { EcosystemPage, IDEA_TYPE_IDS, IdeaDetailPage, IdeasPage, TrustPage, getIdeaBySlug, normalizeIdeaType } from "."

const { explore } = en

describe("NIVO public exploration routes", () => {
    it("preserves the seven-stage Trust progression without invented security evidence", () => {
        const { container } = render(<TrustPage />)
        const html = container.innerHTML
        const anchors = [
            "future-worth-earning",
            "trust-starts-small",
            "human-ai-governance",
            "evidence-before-scale",
            "transformation-journey",
            "what-becomes-possible",
            "truth-before-promise",
        ]
        let previousIndex = -1
        for (const anchor of anchors) {
            const currentIndex = html.indexOf(`id="${anchor}"`)
            expect(currentIndex).toBeGreaterThan(previousIndex)
            previousIndex = currentIndex
        }
        expect(html).toContain("Autonomy must be earned")
        expect(html).not.toContain("enterprise-grade")
        expect(screen.getByText(explore.trust.governance.noticeBody)).toBeInTheDocument()
    })

    it("renders exactly the four canonical ecosystem actors", () => {
        render(<EcosystemPage />)
        const actors = within(screen.getByRole("list", { name: "The four actors of the NIVO ecosystem" }))
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
        const { thesis, sections } = explore.ideas.items["responsibility-before-agent"]
        const index = render(<IdeasPage />)
        const indexHtml = index.container.innerHTML
        expect(indexHtml).toContain("Perspective")
        expect(indexHtml).toContain("Framework")
        expect(indexHtml).toContain("NIVO is building")
        index.unmount()
        const article = render(<IdeaDetailPage idea={idea} />)
        const articleHtml = article.container.innerHTML
        expect(articleHtml.indexOf(thesis)).toBeGreaterThan(-1)
        expect(articleHtml.indexOf(thesis)).toBeLessThan(articleHtml.indexOf(sections.observation.title))
        expect(articleHtml.match(/<h1/g)).toHaveLength(1)
    })

    it("filters Ideas by the stable type id and accepts no other query value", () => {
        expect(IDEA_TYPE_IDS.map((id) => normalizeIdeaType(id))).toEqual(["perspective", "framework", "building"])
        expect(normalizeIdeaType(["building", "framework"])).toBe("building")
        expect(normalizeIdeaType("unknown")).toBeNull()
        expect(normalizeIdeaType(undefined)).toBeNull()
        render(<IdeasPage selectedType="framework" />)
        expect(
            screen.getByRole("heading", { level: 3, name: "Context · Responsibility · Outcome" }),
        ).toBeInTheDocument()
        expect(screen.queryByRole("heading", { level: 3, name: "Responsibility before Agent" })).not.toBeInTheDocument()
    })

    it("uses NIVO icons instead of Unicode arrows across the exploration surfaces", () => {
        const idea = getIdeaBySlug("responsibility-before-agent")
        expect(idea).toBeDefined()
        if (idea === undefined) return

        const html = [
            <TrustPage key="trust" />,
            <EcosystemPage key="ecosystem" />,
            <IdeasPage key="ideas" />,
            <IdeaDetailPage idea={idea} key="detail" />,
        ]
            .map((page) => {
                const view = render(page)
                const markup = view.container.innerHTML
                view.unmount()
                return markup
            })
            .join("")

        expect(html).not.toMatch(new RegExp("[\u2192\u2193]", "u"))
        expect(html).toContain('data-component="Icon"')
        expect(html).toContain('data-usage="chip"')
    })
})
