import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { _AgentOSProvisioning } from "./component"

const steps = [
    {
        ordinal: "1",
        label: "Request",
        state: "done" as const,
        stateLabel: "Complete",
    },
    {
        ordinal: "2",
        label: "Prepare",
        state: "current" as const,
        stateLabel: "Active",
    },
]

describe("AgentOS provisioning lifecycle", () => {
    it("renders request and preparing states with their status copy", () => {
        const base = { props: { steps, subject: "AgentOS", detail: "Workspace plan", statusTitle: "Preparing", statusText: "Provisioning in progress", requestActionLabel: "Order", statusActionLabel: "Refresh" }, on: { request: vi.fn(), statusAction: vi.fn() } }
        expect(renderToStaticMarkup(<_AgentOSProvisioning state="request" {...base} />)).toContain("Provisioning in progress")
        expect(renderToStaticMarkup(<_AgentOSProvisioning state="preparing" {...base} />)).toContain("Refresh")
    })

    it("keeps failure copy and actions visible", () => {
        const html = renderToStaticMarkup(<_AgentOSProvisioning state="failed" props={{ steps, subject: "AgentOS", detail: "Workspace plan", statusTitle: "Failed", statusText: "Could not provision", statusActionLabel: "Retry" }} on={{ statusAction: vi.fn() }} />)
        expect(html).toContain("Could not provision")
        expect(html).toContain("Retry")
    })
})
