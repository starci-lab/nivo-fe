import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import ExploreIdeaPage from "."
import { getIdeaBySlug } from "../../../modules/landing/ideas"
import en from "../../../messages/en.json"

describe("ExploreIdeaPage", () => {
    it("places the direct thesis before the reasoning sections and exposes one primary heading", async () => {
        const idea = getIdeaBySlug("responsibility-before-agent")
        expect(idea).toBeDefined()
        if (idea === undefined) return

        const { thesis, sections } = en.explore.ideas.items["responsibility-before-agent"]
        const { container } = render(<ExploreIdeaPage idea={idea} />)
        await expectNoA11yViolations(container)
        const html = container.innerHTML
        expect(html.indexOf(thesis)).toBeGreaterThan(-1)
        expect(html.indexOf(thesis)).toBeLessThan(html.indexOf(sections.observation.title))
        expect(html.match(/<h1/g)).toHaveLength(1)
    })
})
