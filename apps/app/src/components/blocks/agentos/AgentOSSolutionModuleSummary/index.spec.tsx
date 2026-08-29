import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AgentOSSolutionModuleSummary } from "./index"
const installation = { id: "i", agentWorkspaceId: "w", moduleKey: "sales-copilot", moduleVersion: "1.2", status: "failed", sagaId: null, generatedAgentIds: [], sharedKnowledgeSourceIds: [], channelAccountRefs: [], commonKnowledgeVersion: "v1", privateKnowledgeVersion: "v2", manifestDigest: "manifest", modelProfileRef: "nivo-default", desiredDigest: "desired", appliedDigest: null, knowledgeState: "refused" as const, knowledgeArtifact: null, retrievalScope: { installationId: "i", moduleKey: "sales-copilot", knowledgeVersion: "knowledge-v1" }, failureCode: "TIMEOUT" }
const labels = { section: "Summary", module: "Module", version: "Version", status: "Status", failure: "Failure", modelProfile: "Model profile", manifest: "Manifest", empty: "None" }
describe("solution module summary", () => {
    it("renders immutable identity, lifecycle status, and failure", () => {
        const html = renderToStaticMarkup(<AgentOSSolutionModuleSummary state="ready" installation={installation} labels={labels} />)
        expect(html).toContain("sales-copilot")
        expect(html).toContain("TIMEOUT")
        expect(html).toContain('data-tone="danger"')
    })

    it("distinguishes provisioning and healthy lifecycle states", () => {
        const provisioning = renderToStaticMarkup(<AgentOSSolutionModuleSummary
            state="ready"
            installation={{ ...installation, status: "provisioning", failureCode: null }}
            labels={labels}
        />)
        const ready = renderToStaticMarkup(<AgentOSSolutionModuleSummary
            state="ready"
            installation={{ ...installation, status: "ready", failureCode: null }}
            labels={labels}
        />)
        expect(provisioning).toContain('data-tone="accent"')
        expect(provisioning).toContain("None")
        expect(ready).toContain('data-tone="success"')
    })

    it("rests as the same module summary anatomy", () => {
        const html = renderToStaticMarkup(<AgentOSSolutionModuleSummary state="pending" labels={labels} />)
        expect(html).toContain('data-loading="true"')
        expect(html).not.toContain("sales-copilot")
    })
})
