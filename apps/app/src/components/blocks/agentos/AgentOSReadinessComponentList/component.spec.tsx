import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AgentOSReadinessComponentListBase } from "./component"

describe("AgentOSReadinessComponentListBase", () => {
    it("keeps healthy and refused component verdicts independently visible", () => {
        const html = renderToStaticMarkup(<AgentOSReadinessComponentListBase components={[{ component: "Qdrant", verdict: "healthy" }, { component: "retrieval", verdict: "refused" }]} labels={{ title: "Evidence", evidence: "Owner-safe verdict" }} />)
        expect(html).toContain("Qdrant")
        expect(html).toContain('data-tone="success"')
        expect(html).toContain('data-tone="danger"')
    })
})