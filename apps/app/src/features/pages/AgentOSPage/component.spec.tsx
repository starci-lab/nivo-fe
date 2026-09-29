import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

type ProvisioningProbeProps = { readonly context: { readonly mode: string; readonly orderId?: string } }

vi.mock("@/components/blocks/agentos/BusinessModulesDashboard", () => ({
    BusinessModulesDashboard: () => <div>Business modules dashboard</div>,
}))
vi.mock("@/components/blocks/provisioning/AgentOSProvisioning", () => ({
    AgentOSProvisioning: ({ context }: ProvisioningProbeProps) => (
        <div>
            {context.mode}:{context.orderId}
        </div>
    ),
}))

import { AgentOSPageBase, type AgentOSPageLabels } from "./component"

const labels: AgentOSPageLabels = {
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

describe("AgentOSPageBase", () => {
    it("keeps the dashboard management-only", () => {
        const create = vi.fn()
        const { container } = render(
            <AgentOSPageBase
                state={{ mode: "dashboard" }}
                props={{ labels }}
                on={{ openDashboard: vi.fn(), create }}
            />,
        )
        const html = container.innerHTML
        expect(html).toContain("Business modules dashboard")
        expect(html).toContain("Manage AgentOS workspaces.")
        expect(screen.getByRole("heading", { level: 1, name: "AgentOS" })).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Create" }))
        expect(create).toHaveBeenCalledOnce()
        expect(html).toContain("AgentOS")
        expect(html).not.toContain("new:")
    })

    it("keeps pre-persistence creation on its own page", () => {
        const html = renderToStaticMarkup(
            <AgentOSPageBase
                state={{ mode: "create" }}
                props={{ labels }}
                on={{ openDashboard: vi.fn(), create: vi.fn() }}
            />,
        )
        expect(html).toContain("Create workspace")
        expect(html).toContain("new:")
        expect(html).not.toContain("Business modules dashboard")
    })

    it("passes the persisted order id only to resume mode", () => {
        const html = renderToStaticMarkup(
            <AgentOSPageBase
                state={{ mode: "resume", orderId: "order-1" }}
                props={{ labels }}
                on={{ openDashboard: vi.fn(), create: vi.fn() }}
            />,
        )
        expect(html).toContain("resume:order-1")
        expect(html).toContain("AgentOS order")
    })
})

describe("AgentOSPageBase", () => {
    it("executes the renamed pure twins across their settled state branches", () => {
        const agentOsLabels: AgentOSPageLabels = {
            path: "Path",
            agentos: "AgentOS",
            dashboardDescription: "Manage AgentOS",
            createTitle: "Create",
            createDescription: "Create AgentOS",
            orderTitle: "Order",
            orderDescription: "Resume order",
            createAction: "Create",
        }
        const agentOsCommands = { openDashboard: vi.fn(), create: vi.fn() }
        expect(
            AgentOSPageBase({ state: { mode: "dashboard" }, props: { labels: agentOsLabels }, on: agentOsCommands }),
        ).toBeTruthy()
        expect(
            AgentOSPageBase({
                state: { mode: "resume", orderId: "order-1" },
                props: { labels: agentOsLabels },
                on: agentOsCommands,
            }),
        ).toBeTruthy()
    })
})
