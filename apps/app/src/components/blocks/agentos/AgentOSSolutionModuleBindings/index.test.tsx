import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AgentOSSolutionModuleBindings } from "./index"
const labels = { section: "Bindings", agents: "Agents", channels: "Channels", sharedKnowledge: "Knowledge", knowledgeVersions: "Versions", empty: "None" }
const base = { id: "i", agentWorkspaceId: "w", moduleKey: "sales-copilot", moduleVersion: "1", status: "ready", sagaId: null, generatedAgentIds: [], sharedKnowledgeSourceIds: [], channelAccountRefs: [], commonKnowledgeVersion: "v1", privateKnowledgeVersion: "v2", failureCode: null }
describe("solution module bindings", () => { it("renders empty collection labels", () => { expect(renderToStaticMarkup(<AgentOSSolutionModuleBindings installation={base} labels={labels} />)).toContain("None") }); it("joins generated bindings", () => { const html = renderToStaticMarkup(<AgentOSSolutionModuleBindings installation={{ ...base, generatedAgentIds: ["agent-a", "agent-b"], channelAccountRefs: ["channel-1"] }} labels={labels} />); expect(html).toContain("agent-a, agent-b"); expect(html).toContain("channel-1") }) })
