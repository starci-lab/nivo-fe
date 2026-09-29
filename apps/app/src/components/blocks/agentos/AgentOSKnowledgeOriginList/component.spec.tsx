import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AgentOSKnowledgeOriginListBase } from "./component"

describe("AgentOSKnowledgeOriginListBase", () => {
    it("renders source provenance without exposing a full digest as an action", () => {
        const html = renderToStaticMarkup(
            <AgentOSKnowledgeOriginListBase
                props={{
                    origins: [
                        {
                            origin: "Nivo module snapshot",
                            version: "v3",
                            digest: "1234567890abcdefghijklmnopqrstuvwxyz",
                            documentCount: 4,
                            lastUpdatedAt: null,
                        },
                    ],
                    labels: { title: "Origins", current: "Current", unknownVersion: "Pending" },
                }}
                on={{ documents: (count) => `${count} docs` }}
            />,
        )
        expect(html).toContain("Nivo module snapshot")
        expect(html).toContain("1234567890…")
        expect(html).toContain("4 docs")
        expect(html).toContain('data-tone="success"')
    })
})
