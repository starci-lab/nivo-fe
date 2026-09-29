import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import EcosystemPage from "@/features/pages/EcosystemPage"
import ExploreIdeaPage from "@/features/pages/ExploreIdeaPage"
import TrustPage from "@/features/pages/TrustPage"
import ExplorePage from "."
import { getIdeaBySlug, IDEA_TYPE_IDS, normalizeIdeaType } from "@/modules/landing/ideas"

describe("ExplorePage", () => {
    it("filters Ideas by the stable type id and rejects every other query value", () => {
        expect(IDEA_TYPE_IDS.map((id) => normalizeIdeaType(id))).toEqual(["perspective", "framework", "building"])
        expect(normalizeIdeaType(["building", "framework"])).toBe("building")
        expect(normalizeIdeaType("unknown")).toBeNull()
        expect(normalizeIdeaType(undefined)).toBeNull()

        render(<ExplorePage selectedType="framework" />)
        expect(screen.getByRole("heading", { level: 3, name: "Context · Responsibility · Outcome" })).toBeInTheDocument()
        expect(screen.queryByRole("heading", { level: 3, name: "Responsibility before Agent" })).not.toBeInTheDocument()
    })

    it("keeps the public formats and the NIVO building note on the unfiltered inventory", () => {
        const { container } = render(<ExplorePage />)
        expect(container.innerHTML).toContain("Perspective")
        expect(container.innerHTML).toContain("Framework")
        expect(container.innerHTML).toContain("NIVO is building")
    })

    it("uses NIVO icons rather than Unicode arrows across every exploration surface", () => {
        const idea = getIdeaBySlug("responsibility-before-agent")
        expect(idea).toBeDefined()
        if (idea === undefined) return

        const pages = [
            <TrustPage key="trust" />,
            <EcosystemPage key="ecosystem" />,
            <ExplorePage key="ideas" />,
            <ExploreIdeaPage idea={idea} key="idea" />,
        ]
        let markup = ""
        for (const page of pages) {
            const view = render(page)
            markup += view.container.innerHTML
            view.unmount()
        }
        expect(markup).not.toMatch(new RegExp("[\\u2192\\u2193]", "u"))
        expect(markup).toContain('data-component="Icon"')
        expect(markup).toContain('data-usage="chip"')
    })
})
