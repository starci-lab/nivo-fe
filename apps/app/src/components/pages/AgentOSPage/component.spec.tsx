import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

type ProvisioningProbeProps = { readonly context: { readonly mode: string, readonly orderId?: string } }

vi.mock("@/components/blocks/agentos/AgentOSWorkspaceList", () => ({
    AgentOSWorkspaceList: () => <div>Workspace list</div>,
}))
vi.mock("@/components/blocks/provisioning/AgentOSProvisioning", () => ({
    AgentOSProvisioning: ({ context }: ProvisioningProbeProps) => (
        <div>{context.mode}:{context.orderId}</div>
    ),
}))

import { AgentOSPageBase, type AgentOSPageViewProps } from "./component"

const labels: AgentOSPageViewProps["labels"] = {
    path: "Console path",
    agentos: "AgentOS",
    dashboardDescription: "Manage AgentOS workspaces.",
    createTitle: "Create workspace",
    createDescription: "Choose a tier before an order exists.",
    orderTitle: "AgentOS order",
    orderDescription: "Resume the persisted order.",
    createAction: "Create",
    dashboardEyebrow: "Workspace operations",
    createEyebrow: "New workspace",
    orderEyebrow: "Persisted order",
}

describe("AgentOSPage", () => {
    it("keeps the dashboard management-only", () => {
        const html = renderToStaticMarkup(<AgentOSPageBase
            mode="dashboard"
            labels={labels}
            onOpenDashboard={vi.fn()}
            onCreate={vi.fn()}
        />)
        expect(html).toContain("Workspace list")
        expect(html).toContain("Manage AgentOS workspaces.")
        expect(html).toContain('data-scale="display"')
        expect(html).toContain("AgentOS")
        expect(html).not.toContain("new:")
    })

    it("keeps pre-persistence creation on its own page", () => {
        const html = renderToStaticMarkup(<AgentOSPageBase
            mode="create"
            labels={labels}
            onOpenDashboard={vi.fn()}
            onCreate={vi.fn()}
        />)
        expect(html).toContain("Create workspace")
        expect(html).toContain("new:")
        expect(html).not.toContain("Workspace list")
    })

    it("passes the persisted order id only to resume mode", () => {
        const html = renderToStaticMarkup(<AgentOSPageBase
            mode="resume"
            orderId="order-1"
            labels={labels}
            onOpenDashboard={vi.fn()}
            onCreate={vi.fn()}
        />)
        expect(html).toContain("resume:order-1")
        expect(html).toContain("AgentOS order")
    })
})
