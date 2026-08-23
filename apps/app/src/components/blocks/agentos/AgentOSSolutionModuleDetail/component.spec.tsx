import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSSolutionModuleDetailBase, type AgentOSSolutionModuleDetailViewProps } from "./component"

const installation = {
    id: "installation-1",
    agentWorkspaceId: "workspace-1",
    moduleKey: "sales-copilot",
    moduleVersion: "1.2.0",
    status: "ready",
    sagaId: null,
    generatedAgentIds: ["agent-1"],
    sharedKnowledgeSourceIds: ["knowledge-1"],
    channelAccountRefs: ["channel-1"],
    commonKnowledgeVersion: "common-v1",
    privateKnowledgeVersion: "private-v1",
    manifestDigest: "manifest",
    modelProfileRef: "nivo-default",
    desiredDigest: "desired",
    appliedDigest: "desired",
    knowledgeState: "current" as const,
    knowledgeArtifact: { id: "artifact-1", knowledgeVersion: "knowledge-v1", sourceDigest: "source", snapshotDigest: "snapshot", embeddingProfile: "nivo-embedding-v1", embeddingDimension: 1024, pointCount: 12 },
    retrievalScope: { installationId: "installation-1", moduleKey: "sales-copilot", knowledgeVersion: "knowledge-v1" },
    failureCode: null,
}

const props: Omit<AgentOSSolutionModuleDetailViewProps, "detailState"> = {
    installation,
    labels: {
        title: "Solution module",
        backToWorkspace: "Back to workspace",
        loading: "Loading module",
        refused: "Module unavailable",
        openAiKnowledge: "Open AI & Knowledge",
        knowledgeCurrent: "Knowledge current",
        knowledgeRefreshing: "Knowledge refreshing",
        knowledgeRefused: "Knowledge refused",
        summary: { section: "Summary", module: "Module", version: "Version", status: "Status", failure: "Failure", modelProfile: "Model profile", manifest: "Manifest", empty: "None" },
        bindings: { section: "Bindings", agents: "Agents", channels: "Channels", sharedKnowledge: "Knowledge", knowledgeVersions: "Versions", artifact: "Artifact", currentness: "Currentness", embedding: "Embedding", retrievalScope: "Retrieval scope", empty: "None" },
    },
    onBack: vi.fn(),
    onOpenAiKnowledge: vi.fn(),
}

describe("AgentOSSolutionModuleDetail drawing", () => {
    it("keeps one page anatomy while the detail block is loading", () => {
        const html = renderToStaticMarkup(<AgentOSSolutionModuleDetailBase {...props} detailState="loading" installation={undefined} />)
        expect(html).toContain('data-node="module-detail-page"')
        expect(html).toContain("Loading module")
        expect(html).toContain('data-loading="true"')
        expect(html).not.toContain("sales-copilot")
    })

    it("renders refusal as the detail block answer", () => {
        const html = renderToStaticMarkup(<AgentOSSolutionModuleDetailBase {...props} detailState="refused" installation={undefined} />)
        expect(html).toContain('data-node="module-detail-page"')
        expect(html).toContain("Module unavailable")
        expect(html).not.toContain('data-node="module-summary"')
    })

    it("renders the exact ready installation without changing page anatomy", () => {
        const html = renderToStaticMarkup(<AgentOSSolutionModuleDetailBase {...props} detailState="ready" />)
        expect(html).toContain('data-node="module-detail-page"')
        expect(html).toContain("sales-copilot")
        expect(html).toContain("agent-1")
        expect(html).toContain("Back to workspace")
        expect(html).toContain("Open AI &amp; Knowledge")
    })
})
