import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSProvisioningBase } from "./component"

const steps = [
    {
        ordinal: "1",
        label: "Request",
        state: "done" as const,
        stateLabel: "Complete",
    },
    {
        ordinal: "2",
        label: "Payment",
        state: "current" as const,
        stateLabel: "Active",
    },
    { ordinal: "3", label: "Create workspace", state: "upcoming" as const, stateLabel: "Upcoming" },
    { ordinal: "4", label: "Build infrastructure", state: "upcoming" as const, stateLabel: "Upcoming" },
    { ordinal: "5", label: "Manage", state: "upcoming" as const, stateLabel: "Upcoming" },
]

describe("AgentOS provisioning lifecycle", () => {
    it("keeps request pending inside the responsive five-stage composition", () => {
        const html = renderToStaticMarkup(<AgentOSProvisioningBase
            state="submitting"
            props={{ steps, subject: "AgentOS", detail: "Workspace plan", statusTitle: "Requesting", statusText: "Submitting", requestActionLabel: "Order", isRequestPending: true }}
            on={{ request: vi.fn() }}
        />)
        expect(html).toContain('data-node="responsive-five-stage-lifecycle-run"')
        expect(html).toContain('data-action-pending="true"')
    })

    it("renders all five progress stages responsively and keeps watch controls disabled", () => {
        const html = renderToStaticMarkup(<AgentOSProvisioningBase
            state="preparing"
            props={{ steps, subject: "AgentOS", detail: "Workspace plan", statusTitle: "Preparing", statusText: "Provisioning in progress", statusActionLabel: "Watch provisioning", statusActionDisabled: true }}
            on={{ statusAction: vi.fn() }}
        />)
        expect(html).toContain('data-node="responsive-five-stage-lifecycle-run"')
        expect(html.match(/data-node="ordinal-over-label-and-state"/g)).toHaveLength(5)
        expect(html).toContain("Watch provisioning")
        expect(html).toContain("disabled")
    })

    it("keeps failure copy and actions visible", () => {
        const html = renderToStaticMarkup(<AgentOSProvisioningBase state="failed" props={{ steps, subject: "AgentOS", detail: "Workspace plan", statusTitle: "Failed", statusText: "Could not provision", statusActionLabel: "Retry" }} on={{ statusAction: vi.fn() }} />)
        expect(html).toContain("Could not provision")
        expect(html).toContain("Retry")
    })
})
