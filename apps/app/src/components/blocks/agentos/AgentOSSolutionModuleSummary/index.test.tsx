import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AgentOSSolutionModuleSummary } from "./index"
const installation = { id: "i", agentWorkspaceId: "w", moduleKey: "sales-copilot", moduleVersion: "1.2", status: "failed", sagaId: null, generatedAgentIds: [], sharedKnowledgeSourceIds: [], channelAccountRefs: [], commonKnowledgeVersion: "v1", privateKnowledgeVersion: "v2", failureCode: "TIMEOUT" }
const labels = { section: "Summary", module: "Module", version: "Version", status: "Status", failure: "Failure", empty: "None" }
describe("solution module summary", () => { it("renders identity and failure", () => { const html = renderToStaticMarkup(<AgentOSSolutionModuleSummary installation={installation} labels={labels} />); expect(html).toContain("sales-copilot"); expect(html).toContain("TIMEOUT") }) })
