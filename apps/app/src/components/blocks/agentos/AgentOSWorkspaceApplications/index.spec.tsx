import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSWorkspaceApplications } from "./index"

const labels = { section: "Apps", openclaw: "OpenClaw", n8n: "n8n", openclawDescription: "Chat", n8nDescription: "Automate", available: "Available", unavailable: "Unavailable", manage: "Manage", unavailableAction: "Unavailable", securityUpgradeRequired: "Upgrade required", unavailableDetail: "Not available", opening: "Opening", openAgain: "Open again", blocked: "Blocked", expired: "Expired", disconnected: "Disconnected" }

describe("AgentOS workspace applications", () => {
    it("shows security refusal before launch state and disables unavailable apps", () => {
        const html = renderToStaticMarkup(<AgentOSWorkspaceApplications apps={[{ app: "OPENCLAW", accessMode: "UNAVAILABLE", available: false, reason: "SECURITY_UPGRADE_REQUIRED", observedVersion: null }, { app: "N8N", accessMode: "UNAVAILABLE", available: false, reason: null, observedVersion: null }]} labels={labels} launchState="blocked" openClawLaunchHref="/openclaw" onManageOpenClaw={vi.fn()} />)
        expect(html).toContain("Upgrade required")
        expect(html).toContain("Unavailable")
    })

    it("renders opening and connected launch copy", () => {
        const app = [{ app: "OPENCLAW" as const, accessMode: "NIVO_CONSOLE" as const, available: true, reason: null, observedVersion: "1.2.3" }]
        expect(renderToStaticMarkup(<AgentOSWorkspaceApplications apps={app} labels={labels} launchState="opening" openClawLaunchHref="/openclaw" onManageOpenClaw={vi.fn()} />)).toContain("Opening")
        expect(renderToStaticMarkup(<AgentOSWorkspaceApplications apps={app} labels={labels} launchState="connected" openClawLaunchHref="/openclaw" onManageOpenClaw={vi.fn()} />)).toContain("1.2.3")
    })

    it("offers the accepted open-again transition only after launch expiry", () => {
        const app = [{ app: "OPENCLAW" as const, accessMode: "NIVO_CONSOLE" as const, available: true, reason: null, observedVersion: "1.2.3" }]
        const html = renderToStaticMarkup(<AgentOSWorkspaceApplications apps={app} labels={labels} launchState="expired" openClawLaunchHref="/openclaw" onManageOpenClaw={vi.fn()} />)
        expect(html).toContain("Open again")
        expect(html).toContain("Expired")
    })
})
