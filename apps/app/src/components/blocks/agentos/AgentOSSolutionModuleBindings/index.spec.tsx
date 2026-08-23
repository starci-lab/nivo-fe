import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AgentOSSolutionModuleBindings } from "./index"
const labels = { section: "Bindings", agents: "Agents", channels: "Channels", sharedKnowledge: "Knowledge", knowledgeVersions: "Versions", artifact: "Artifact", currentness: "Currentness", embedding: "Embedding", retrievalScope: "Retrieval scope", empty: "None" }
const base = { id: "i", agentWorkspaceId: "w", moduleKey: "sales-copilot", moduleVersion: "1", status: "ready", sagaId: null, generatedAgentIds: [], sharedKnowledgeSourceIds: [], channelAccountRefs: [], commonKnowledgeVersion: "v1", privateKnowledgeVersion: "v2", manifestDigest: "manifest", modelProfileRef: "nivo-default", desiredDigest: "desired", appliedDigest: "desired", knowledgeState: "current" as const, knowledgeArtifact: { id: "artifact-1", knowledgeVersion: "knowledge-v1", sourceDigest: "source", snapshotDigest: "snapshot", embeddingProfile: "nivo-embedding-v1", embeddingDimension: 1024, pointCount: 12 }, retrievalScope: { installationId: "i", moduleKey: "sales-copilot", knowledgeVersion: "knowledge-v1" }, failureCode: null }
describe("solution module bindings", () => {
    it("keeps each empty producer-owned group visible", () => {
        const html = renderToStaticMarkup(<AgentOSSolutionModuleBindings state="ready" installation={base} labels={labels} />)
        expect(html).toContain('data-node="module-bindings"')
        expect(html.match(/data-level="4"/g)).toHaveLength(8)
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

    it("rests as eight binding and artifact groups with the same anatomy", () => {
        const html = renderToStaticMarkup(<AgentOSSolutionModuleBindings state="pending" labels={labels} />)
        expect(html).toContain('data-node="module-bindings"')
        expect(html.match(/data-node="binding-identity-list"/g)).toHaveLength(8)
        expect(html.match(/data-loading="true"/g)).toHaveLength(16)
    })
})
