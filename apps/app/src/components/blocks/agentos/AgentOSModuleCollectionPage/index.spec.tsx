import { render } from "@testing-library/react"
import type { AgentOSShellView, AgentOSWorkspaceControlCenterShellLabels } from "@/components/blocks/agentos/AgentOSWorkspaceControlCenter"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AgentOSModuleCollectionPageBase } from "./component"
import { AgentOSModuleCollectionPage } from "./index"

const shell: AgentOSShellView = {
    state: "access-denied",
    workspaceId: null,
    instanceId: null,
    name: null,
    identityObservedAt: null,
    inventoryStanding: "refused",
    inventoryObservedAt: null,
    inventoryEmpty: false,
    runtimeStanding: "unresolved",
    runtimeAvailability: null,
    runtimeGeneration: null,
    runtimeObservedAt: null,
    installations: [],
    attentionStanding: "unresolved",
    attentionObservedAt: null,
    operations: [],
    retrying: false,
}
const shellLabels: AgentOSWorkspaceControlCenterShellLabels = {
    headingFallback: "Workspace",
    eyebrow: "AgentOS",
    description: "Workspace modules",
    signInRequired: "Sign in",
    signInAction: "Sign in",
    accessDenied: "Access denied",
    accessUnverified: "Access unavailable",
    retry: "Retry",
    loading: "Loading",
    sourceTime: "Checked",
    identityInstance: "Instance",
    inventorySection: "Inventory",
    inventoryEmpty: "No modules",
    inventoryEmptyDescription: "Install a module",
    inventoryLimitPartial: "Partial inventory",
    inventoryLimitStale: "Stale inventory",
    inventoryLimitUnavailable: "Inventory unavailable",
    inventoryLimitUnsupported: "Inventory unsupported",
    inventoryLimitRefused: "Inventory refused",
    inventoryLimitLoading: "Inventory loading",
    lastKnown: "Last known",
    retrying: "Retrying",
    runtimeSection: "Runtime",
    runtimeProvisioned: "Provisioned",
    runtimeNotProvisioned: "Not provisioned",
    runtimeUnavailable: "Unavailable",
    runtimeUnknown: "Unknown",
    configurationSection: "Configuration",
    configurationAbsent: "No configuration",
    configurationUnsupported: "Unsupported configuration",
    attentionSection: "Attention",
    attentionUnsupported: "Unsupported attention",
    resultSection: "Result",
    resultUnavailable: "Unavailable result",
    resultPending: "Pending result",
    resultConfirmed: "Confirmed result",
    resultUncertain: "Uncertain result",
    resultRecheck: "Recheck result",
    installEntry: "Install",
}

describe("AgentOSModuleCollectionPage", () => {
    it("exports its connected route owner", () => {
        expect(AgentOSModuleCollectionPage).toBeTypeOf("function")
    })

    it("has no axe violations in the access-limited collection", async () => {
        const { container } = render(
            <AgentOSModuleCollectionPageBase
                props={{
                    workspaceId: "workspace-1",
                    shell,
                    shellLabels,
                    labels: {
                        path: "Path",
                        workspace: "Workspace",
                        title: "Modules",
                        browseCatalog: "Browse catalog",
                        installFlow: "Install",
                        runtimeProvisioned: "Provisioned",
                        runtimeNotProvisioned: "Not provisioned",
                        runtimeUnavailable: "Unavailable",
                        runtimeUnknown: "Unknown",
                    },
                    createHref: "/agentos/workspaces/workspace-1/modules/create",
                }}
                on={{
                    onBack: vi.fn(),
                    formatDate: (value) => value,
                    checkedAt: (time) => time,
                    installedIn: (name) => name,
                    runtimeLine: (value) => value,
                    formatConfiguration: () => "Configuration",
                }}
            />,
        )
        await expectNoA11yViolations(container)
    })
})
