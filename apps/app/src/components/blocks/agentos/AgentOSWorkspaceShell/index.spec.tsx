import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AgentOSWorkspaceShell } from "./index"
import type { AgentOSShellView, AgentOSWorkspaceControlCenterShellLabels } from "@/modules/agentos/workspace-control-center/shell-types"

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

const view: AgentOSShellView = {
    state: "installed-current",
    workspaceId: "workspace-1",
    instanceId: "instance-1",
    name: "Acme workspace",
    identityObservedAt: "2026-09-26T03:00:00.000Z",
    inventoryStanding: "current",
    inventoryObservedAt: "2026-09-26T03:00:00.000Z",
    inventoryEmpty: false,
    runtimeStanding: "current",
    runtimeAvailability: "provisioned",
    runtimeGeneration: "generation-1",
    runtimeObservedAt: "2026-09-26T03:00:00.000Z",
    installations: [
        {
            installationId: "installation-1",
            moduleKey: "sales-copilot",
            displayName: "Sales Copilot",
            status: "installed",
            configuration: null,
        },
    ],
    attentionStanding: "unsupported",
    attentionObservedAt: null,
    operations: [],
    retrying: false,
}

describe("AgentOSWorkspaceShell", () => {
    it("draws each installation beside its source-qualified runtime facets", () => {
        render(<AgentOSWorkspaceShell view={view} labels={labels} formatDate={() => "Observed now"} formatConfiguration={({ desired, tested, applied }) => `${desired}/${tested}/${applied}`} />)

        expect(screen.getByText("Sales Copilot")).toBeInTheDocument()
        expect(screen.getByText("Provisioned")).toBeInTheDocument()
        expect(screen.getByText("Configuration unsupported")).toBeInTheDocument()
    })
})
