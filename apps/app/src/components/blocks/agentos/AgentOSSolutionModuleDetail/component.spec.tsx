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
    failureCode: null,
}

const props: Omit<AgentOSSolutionModuleDetailViewProps, "detailState"> = {
    installation,
    labels: {
        title: "Solution module",
        backToWorkspace: "Back to workspace",
        loading: "Loading module",
        refused: "Module unavailable",
        summary: { section: "Summary", module: "Module", version: "Version", status: "Status", failure: "Failure", empty: "None" },
        bindings: { section: "Bindings", agents: "Agents", channels: "Channels", sharedKnowledge: "Knowledge", knowledgeVersions: "Versions", empty: "None" },
    },
    onBack: vi.fn(),
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
    })
})
