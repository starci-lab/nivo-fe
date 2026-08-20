import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AgentOSSolutionModuleBindings } from "./index"
const labels = { section: "Bindings", agents: "Agents", channels: "Channels", sharedKnowledge: "Knowledge", knowledgeVersions: "Versions", empty: "None" }
const base = { id: "i", agentWorkspaceId: "w", moduleKey: "sales-copilot", moduleVersion: "1", status: "ready", sagaId: null, generatedAgentIds: [], sharedKnowledgeSourceIds: [], channelAccountRefs: [], commonKnowledgeVersion: "v1", privateKnowledgeVersion: "v2", failureCode: null }
describe("solution module bindings", () => {
    it("keeps each empty producer-owned group visible", () => {
        const html = renderToStaticMarkup(<AgentOSSolutionModuleBindings state="ready" installation={base} labels={labels} />)
        expect(html).toContain('data-node="module-bindings"')
        expect(html.match(/data-level="4"/g)).toHaveLength(4)
        expect(html.match(/None/g)).toHaveLength(3)
        expect(html).toContain("v1")
        expect(html).toContain("v2")
    })

    it("renders generated identifiers as separate complete values", () => {
        const html = renderToStaticMarkup(<AgentOSSolutionModuleBindings
            state="ready"
            installation={{ ...base, generatedAgentIds: ["agent-a", "agent-b"], channelAccountRefs: ["channel-1"] }}
            labels={labels}
        />)
        expect(html).toContain("agent-a")
        expect(html).toContain("agent-b")
        expect(html).not.toContain("agent-a, agent-b")
        expect(html).toContain("channel-1")
    })

    it("rests as four binding groups with the same anatomy", () => {
        const html = renderToStaticMarkup(<AgentOSSolutionModuleBindings state="pending" labels={labels} />)
        expect(html).toContain('data-node="module-bindings"')
        expect(html.match(/data-node="binding-identity-list"/g)).toHaveLength(4)
        expect(html.match(/data-loading="true"/g)).toHaveLength(8)
    })
})
