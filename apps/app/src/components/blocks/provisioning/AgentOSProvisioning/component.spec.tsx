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
    { ordinal: "4", label: "Ready", state: "upcoming" as const, stateLabel: "Upcoming" },
]

describe("AgentOS provisioning lifecycle", () => {
    it("keeps request pending inside the connected four-stage composition", () => {
        const html = renderToStaticMarkup(<AgentOSProvisioningBase
            state="submitting"
            props={{ progressLabel: "AgentOS order", continuationLabel: "Next step", steps, subject: "AgentOS", detail: "Workspace plan", statusTitle: "Requesting", statusText: "Submitting", requestActionLabel: "Order", isRequestPending: true }}
            on={{ request: vi.fn() }}
        />)
        expect(html).toContain('data-action-pending="true"')
        expect(html).toContain('data-size="md"')
        expect(html).toContain('data-weight="medium"')
        expect(html.match(/<h3/g)).toHaveLength(1)
        expect(html).toContain("AgentOS order")
        expect(html).not.toContain("Next step")
        expect(html).toContain("AgentOS")
        expect(html).toContain('data-signal="none"')
    })

    it("renders all four progress stages responsively and keeps watch controls disabled", () => {
        const html = renderToStaticMarkup(<AgentOSProvisioningBase
            state="preparing"
            props={{ steps, subject: "AgentOS", detail: "Workspace plan", statusTitle: "Preparing", statusText: "Provisioning in progress", statusActionLabel: "Watch provisioning", statusActionDisabled: true }}
            on={{ statusAction: vi.fn() }}
        />)
        expect(html.match(/Upcoming/g)).toHaveLength(2)
        expect(html).toContain("Watch provisioning")
        expect(html).toContain("disabled")
    })

    it("keeps failure copy and actions visible", () => {
        const html = renderToStaticMarkup(<AgentOSProvisioningBase state="failed" props={{ steps, subject: "AgentOS", detail: "Workspace plan", statusTitle: "Failed", statusText: "Could not provision", statusActionLabel: "Retry" }} on={{ statusAction: vi.fn() }} />)
        expect(html).toContain("Could not provision")
        expect(html).toContain("Retry")
    })

    it("highlights only a persisted continuation with an operable destination", () => {
        const html = renderToStaticMarkup(<AgentOSProvisioningBase
            state="awaiting_payment"
            props={{ steps, subject: "AgentOS", detail: "Workspace plan", statusTitle: "Complete payment", statusText: "Pay the linked invoice", statusActionLabel: "Open Wallet" }}
            on={{ statusAction: vi.fn() }}
        />)

        expect(html).toContain("Request")
        expect(html.match(/<h3/g)).toHaveLength(1)
    })
})
