import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AgentOSShellOperationRegion } from "./index"
import type { AgentOSShellOperationView, AgentOSWorkspaceControlCenterShellLabels } from "@/modules/agentos/workspace-control-center/shell-types"

const labels: AgentOSWorkspaceControlCenterShellLabels = {
    headingFallback: "Workspace",
    eyebrow: "AgentOS",
    description: "Workspace description",
    signInRequired: "Sign in",
    signInAction: "Continue",
    accessDenied: "Access denied",
    accessUnverified: "Access could not be verified",
    retry: "Retry",
    loading: "Loading",
    sourceTime: "Observed",
    identityInstance: "Instance",
    inventorySection: "Installed modules",
    inventoryEmpty: "No modules",
    inventoryEmptyDescription: "Install a module to get started",
    inventoryLimitPartial: "Some evidence is partial",
    inventoryLimitStale: "Evidence is stale",
    inventoryLimitUnavailable: "Evidence is unavailable",
    inventoryLimitUnsupported: "Evidence is unsupported",
    inventoryLimitRefused: "Evidence was refused",
    inventoryLimitLoading: "Evidence is loading",
    lastKnown: "Last known",
    retrying: "Retrying",
    runtimeSection: "Runtime",
    runtimeProvisioned: "Provisioned",
    runtimeNotProvisioned: "Not provisioned",
    runtimeUnavailable: "Unavailable",
    runtimeUnknown: "Unknown",
    configurationSection: "Configuration",
    configurationAbsent: "Configuration absent",
    configurationUnsupported: "Configuration unsupported",
    attentionSection: "Attention",
    attentionUnsupported: "Attention unsupported",
    resultSection: "Result",
    resultUnavailable: "Result unavailable",
    resultPending: "Result pending",
    resultConfirmed: "Result confirmed",
    resultUncertain: "Result uncertain",
    resultRecheck: "Recheck",
    installEntry: "Install",
}

const operation: AgentOSShellOperationView = {
    installationId: "installation-1",
    intentId: "intent-1",
    commandId: "command-1",
    receiverName: "Sales Copilot",
    standing: "pending",
    observedAt: "2026-09-26T03:00:00.000Z",
}

describe("AgentOSShellOperationRegion", () => {
    it("keeps each receiver result source-qualified and offers its own recheck", async () => {
        const onRecheck = vi.fn()
        const { container } = render(
            <AgentOSShellOperationRegion
                operations={[operation]}
                labels={labels}
                formatDate={() => "Observed just now"}
                onRecheck={onRecheck}
            />,
        )

        expect(screen.getByText("Result · Sales Copilot")).toBeInTheDocument()
        expect(screen.getByText("Result pending")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Recheck" }))
        expect(onRecheck).toHaveBeenCalledWith("installation-1", "intent-1")
        await expectNoA11yViolations(container)
    })
})
