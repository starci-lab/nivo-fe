import { describe, expect, it } from "vitest"
import type { AgentOSShellView, AgentOSWorkspaceControlCenterShellLabels } from "./shell-types"
import { facetLimitOf, operationValueOf, runtimeValueOf } from "./shell-display"

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
    runtimeUnavailable: "Runtime unavailable",
    runtimeUnknown: "Runtime unknown",
    configurationSection: "Configuration",
    configurationAbsent: "Configuration absent",
    configurationUnsupported: "Configuration unsupported",
    attentionSection: "Attention",
    attentionUnsupported: "Attention unsupported",
    resultSection: "Result",
    resultUnavailable: "Result unavailable",
    resultPending: "Pending",
    resultConfirmed: "Confirmed",
    resultUncertain: "Uncertain",
    resultRecheck: "Recheck",
    installEntry: "Install",
}

const view: AgentOSShellView = {
    state: "installed-current",
    workspaceId: "workspace-1",
    instanceId: "instance-1",
    name: "Acme",
    identityObservedAt: null,
    inventoryStanding: "current",
    inventoryObservedAt: null,
    inventoryEmpty: false,
    runtimeStanding: "unsupported",
    runtimeAvailability: null,
    runtimeGeneration: null,
    runtimeObservedAt: null,
    installations: [],
    attentionStanding: "unsupported",
    attentionObservedAt: null,
    operations: [],
    retrying: false,
}

describe("shell display facts", () => {
    it("chooses copy from each facet and receiver standing", () => {
        expect(facetLimitOf("stale", labels)).toBe("Evidence is stale")
        expect(runtimeValueOf(view, labels)).toBe("Evidence is unsupported")
        expect(
            operationValueOf(
                {
                    installationId: "installation-1",
                    intentId: "intent-1",
                    commandId: null,
                    receiverName: "Sales Copilot",
                    standing: "confirmed",
                    observedAt: null,
                },
                labels,
            ),
        ).toBe("Confirmed")
    })
})
