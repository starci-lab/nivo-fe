import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AgentOSWorkspaceApplicationsPane } from "./index"
import type { AgentOSWorkspaceControlCenterLabels } from "@/modules/agentos/workspace-control-center/labels"

type ApplicationsProbeProps = { readonly openClawLaunchHref: string }

vi.mock("@/components/blocks/agentos/AgentOSWorkspaceApplications", () => ({
    AgentOSWorkspaceApplications: ({ openClawLaunchHref }: ApplicationsProbeProps) => (
        <output>{openClawLaunchHref}</output>
    ),
}))

describe("AgentOSWorkspaceApplicationsPane", () => {
    it("passes the launch destination into the applications pane", () => {
        render(
            <AgentOSWorkspaceApplicationsPane
                data={{
                    workspace: {
                        id: "workspace-1",
                        name: "Acme",
                        status: "active",
                        externalWorkspaceRef: null,
                    },
                    instance: null,
                    apps: [],
                    runtime: null,
                }}
                labels={{
                    section: "Applications",
                    openclaw: "OpenClaw",
                    n8n: "n8n",
                    openclawDescription: "OpenClaw description",
                    n8nDescription: "n8n description",
                    available: "Available",
                    unavailable: "Unavailable",
                    manage: "Manage",
                    unavailableAction: "Unavailable",
                    securityUpgradeRequired: "Upgrade required",
                    unavailableDetail: "Unavailable detail",
                    opening: "Opening",
                    openAgain: "Open again",
                    blocked: "Blocked",
                    expired: "Expired",
                    disconnected: "Disconnected",
                } satisfies AgentOSWorkspaceControlCenterLabels["applications"]}
                launchState="idle"
                openClawLaunchHref="/en/launch/agentos/workspace-1/openclaw"
                onManageOpenClaw={vi.fn()}
            />,
        )

        expect(screen.getByText("/en/launch/agentos/workspace-1/openclaw")).toBeInTheDocument()
    })
})
