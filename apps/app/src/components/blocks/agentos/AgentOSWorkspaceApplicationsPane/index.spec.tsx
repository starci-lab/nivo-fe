import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AgentOSWorkspaceApplicationsPane } from "./index"
import type { AgentOSWorkspaceControlCenterLabels } from "@/modules/agentos/workspace-control-center/labels"

describe("AgentOSWorkspaceApplicationsPane", () => {
    it("draws the real applications pane with its workspace launch destination", async () => {
        const { container } = render(
            <AgentOSWorkspaceApplicationsPane
                data={{
                    workspace: {
                        id: "workspace-1",
                        name: "Acme",
                        status: "active",
                        externalWorkspaceRef: null,
                    },
                    instance: null,
                    apps: [
                        {
                            app: "OPENCLAW",
                            accessMode: "NIVO_CONSOLE",
                            available: true,
                            reason: null,
                            observedVersion: "1.2.3",
                        },
                    ],
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

        expect(screen.getByRole("link", { name: "Manage" })).toHaveAttribute(
            "href",
            "/en/launch/agentos/workspace-1/openclaw",
        )
        await expectNoA11yViolations(container)
    })
})
