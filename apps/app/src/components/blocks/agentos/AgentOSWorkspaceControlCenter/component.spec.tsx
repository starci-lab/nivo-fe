import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { ShellSourceIdentity } from "@/modules/api/agentos-shell"
import type { ShellSourceObservation, ShellSourceStanding } from "@/modules/agentos/shell-observation-store"

type RuntimeProbeProps = { readonly data: unknown }
type ApplicationsProbeProps = { readonly apps: unknown }
type CollectionProbeProps = { readonly workspaceId: string }

vi.mock("@/components/blocks/agentos/AgentOSWorkspaceApplications", () => ({
    AgentOSWorkspaceApplications: ({ apps }: ApplicationsProbeProps) => (
        <div data-testid="applications">{JSON.stringify(apps)}</div>
    ),
}))
vi.mock("@/components/blocks/agentos/AgentOSWorkspaceSummary", () => ({
    AgentOSWorkspaceSummary: ({ data }: RuntimeProbeProps) => <div data-testid="summary">{JSON.stringify(data)}</div>,
}))
vi.mock("@/components/blocks/agentos/AgentOSWorkspaceRuntime", () => ({
    AgentOSWorkspaceRuntime: ({ data }: RuntimeProbeProps) => <div data-testid="runtime">{JSON.stringify(data)}</div>,
}))
vi.mock("@/components/blocks/agentos/AgentOSSolutionModuleCenter", () => ({
    AgentOSSolutionModuleCenter: ({ workspaceId }: CollectionProbeProps) => (
        <div data-testid="solutions">{workspaceId}</div>
    ),
}))
vi.mock("@/components/blocks/agentos/AgentOSWorkspaceAiKnowledge", () => ({
    AgentOSWorkspaceAiKnowledge: ({ workspaceId }: CollectionProbeProps) => (
        <div data-testid="ai-knowledge">{workspaceId}</div>
    ),
}))
vi.mock("@/components/blocks/operations/AgentOSWorkspaceOperations", () => ({
    AgentOSWorkspaceOperations: () => <div data-testid="operations" />,
}))
vi.mock("@/components/blocks/operations/HelmStackSnapshot", () => ({
    HelmStackSnapshot: () => <div data-testid="stack" />,
}))

import {
    AgentOSWorkspaceControlCenterBase as AgentOSWorkspaceControlCenterBaseView,
    type AgentOSWorkspaceControlCenterViewProps,
} from "./component"
import { projectAgentOSShellView } from "@/modules/agentos/workspace-control-center/shell-projection"
import type { AgentOSShellReading, AgentOSWorkspaceControlCenterShellLabels } from "@/modules/agentos/workspace-control-center/shell-types"
import type { AgentOSWorkspaceControlCenterLabels } from "@/modules/agentos/workspace-control-center/labels"

const AgentOSWorkspaceControlCenterBase = (view: AgentOSWorkspaceControlCenterViewProps) => {
    const {
        pageState,
        onSelectPageState,
        onOpenAgentConsole,
        onRetry,
        onRetryShell,
        onRetryOperation,
        formatDate,
        formatConfiguration,
        ...data
    } = view
    return (
        <AgentOSWorkspaceControlCenterBaseView
            state={pageState}
            props={data}
            on={{ onSelectPageState, onOpenAgentConsole, onRetry, onRetryShell, onRetryOperation, formatDate, formatConfiguration }}
        />
    )
}

const labels: AgentOSWorkspaceControlCenterShellLabels = {
    headingFallback: "AgentOS workspace",
    eyebrow: "AgentOS",
    description: "The actual installed modules.",
    signInRequired: "Sign in to view this workspace.",
    signInAction: "Sign in",
    accessDenied: "Current access is not permitted.",
    accessUnverified: "Access could not be verified.",
    retry: "Retry",
    loading: "Reading the latest status.",
    sourceTime: "Observed at",
    identityInstance: "instance",
    inventorySection: "Installed modules",
    inventoryEmpty: "No module is installed.",
    inventoryEmptyDescription: "The observation is complete and authorized.",
    inventoryLimitPartial: "The module list was only observed in part.",
    inventoryLimitStale: "The module list is last-known.",
    inventoryLimitUnavailable: "The module list source is not answering.",
    inventoryLimitUnsupported: "This source does not support the module list.",
    inventoryLimitRefused: "The module list source refused.",
    inventoryLimitLoading: "Reading the module list.",
    lastKnown: "Last known",
    retrying: "Retrying",
    runtimeSection: "Runtime",
    runtimeProvisioned: "Runtime is provisioned.",
    runtimeNotProvisioned: "Runtime is not provisioned.",
    runtimeUnavailable: "Runtime is currently unavailable.",
    runtimeUnknown: "The runtime standing could not be established.",
    configurationSection: "Configuration",
    configurationAbsent: "No configuration observation exists.",
    configurationUnsupported: "This source does not support configuration.",
    attentionSection: "Needs attention",
    attentionUnsupported: "This source does not support attention.",
    resultSection: "Latest result",
    resultUnavailable: "No result has been observed.",
    resultPending: "The receiver accepted the operation and its result is still pending.",
    resultConfirmed: "The receiver confirmed the operation result.",
    resultUncertain: "The receiver has not clearly confirmed the operation result.",
    resultRecheck: "Read the result again",
    installEntry: "Install module",
}

const sourceObservation = (
    identity: ShellSourceIdentity,
    state: ShellSourceStanding,
    extra: Partial<ShellSourceObservation> = {},
): ShellSourceObservation => ({
    identity,
    readGeneration: 1,
    state,
    availability: state === "available" || state === "partial" ? "available" : null,
    freshness: state === "available" || state === "partial" ? "current" : null,
    completeness: state === "available" || state === "partial" ? "complete" : null,
    observedAt: "2026-09-26T03:00:00.000Z",
    payload: null,
    ...extra,
})

const reading = (
    sources: ReadonlyArray<ShellSourceObservation>,
    session: AgentOSShellReading["session"] = "established",
): AgentOSShellReading => ({ session, sessionStatus: "signed-in", sources })

const identity = sourceObservation({ kind: "core_registry" }, "available", {
    payload: { workspaceId: "ws-1", instanceId: "inst-1", name: "Acme AgentOS", runtimeAvailability: "provisioned" },
})
const runtime = sourceObservation({ kind: "runtime" }, "available", {
    payload: { runtimeGeneration: "gen-1", runtimeAvailability: "provisioned" },
})
const attention = sourceObservation({ kind: "attention", installationId: "installation-1" }, "unsupported")
const inventoryOf = (
    rows: ReadonlyArray<Readonly<Record<string, unknown>>>,
    extra: Partial<ShellSourceObservation> = {},
) => sourceObservation({ kind: "installation_inventory" }, "available", { payload: { installations: rows }, ...extra })
const row = (installationId: string, moduleKey: string, displayName: string, status: string) => ({
    installationId,
    moduleKey,
    displayName,
    status,
})

const workspaceLabels: AgentOSWorkspaceControlCenterLabels = {
    titleFallback: "AgentOS workspace",
    eyebrow: "AgentOS",
    description: "Manage this workspace.",
    stateSection: "Workspace status",
    readyStatus: "Workspace is ready",
    loadingTitle: "Loading workspace",
    refusedTitle: "Cannot open workspace",
    retry: "Retry",
    loading: "Reading.",
    accessUnavailable: "No reusable credentials.",
    tabsLabel: "Sections",
    shell: labels,
    tabs: [{ id: "overview", label: "Overview" }],
    summary: {
        section: "Summary",
        status: "Status",
        plan: "Plan",
        allocation: "Allocation",
        host: "Host",
        chart: "Chart",
            unprovisioned: "Workspace is not provisioned",
    },
    applications: {
        section: "Applications",
        openclaw: "OpenClaw",
        n8n: "n8n",
        openclawDescription: "OpenClaw description",
        n8nDescription: "n8n description",
        available: "Available",
        unavailable: "Unavailable",
        manage: "Manage",
        unavailableAction: "Unavailable",
        securityUpgradeRequired: "A security upgrade is required",
        unavailableDetail: "Application unavailable",
        opening: "Opening",
        openAgain: "Open again",
        blocked: "Blocked",
        expired: "Expired",
        disconnected: "Disconnected",
    },
    runtime: {
        section: "Runtime",
        cpu: "CPU",
        memory: "Memory",
        requests: "Requests",
        limits: "Limits",
        restarts: "Restarts",
        health: "Health",
        fresh: "Current",
        stale: "Stale",
        unavailable: "Unavailable",
    },
    stack: { section: "Stack", unavailable: "Unavailable", release: "Release", chart: "Chart", storage: "Storage" },
    operations: {
        section: "Operations",
        note: "Lifecycle operations are unavailable",
        update: "Update",
        plan: "Plan",
        backup: "Backup",
        reset: "Reset",
        rebuild: "Rebuild",
    },
}

const baseProps: Omit<AgentOSWorkspaceControlCenterViewProps, "shell"> = {
    workspaceId: "ws-1",
    pageState: "overview",
    controlCenterState: "ready",
    data: undefined,
    labels: workspaceLabels,
    onSelectPageState: vi.fn(),
    onOpenAgentConsole: vi.fn(),
    openClawLaunchHref: "/en/launch",
    launchState: "idle",
    formatDate: (value) => value,
    formatConfiguration: ({ desired, tested, applied }) =>
        `desired ${desired} · tested ${tested} · applied ${applied}`,
}

describe("AgentOSWorkspaceControlCenterBase", () => {
    it("renders the exact owned identity and every installation beside its own facets", () => {
        const shell = projectAgentOSShellView(
            reading([
                identity,
                runtime,
                attention,
                inventoryOf([
                    row("installation-1", "sales-copilot", "Sales Copilot", "installed"),
                    row("installation-2", "sales-copilot", "Sales Copilot EU", "installed"),
                ]),
                sourceObservation({ kind: "configuration", installationId: "installation-1" }, "available", {
                    payload: {
                        installationId: "installation-1",
                        configurationIdentity: { desiredDigest: "d", testedDigest: null, appliedDigest: null },
                    },
                }),
            ]),
            labels,
        )
        render(<AgentOSWorkspaceControlCenterBase {...baseProps} shell={shell} />)
        expect(screen.getByRole("heading", { level: 1, name: "Acme AgentOS" })).toBeInTheDocument()
        expect(screen.getByText("Sales Copilot")).toBeInTheDocument()
        expect(screen.getByText("Sales Copilot EU")).toBeInTheDocument()
        expect(screen.getByText(/installation-1/)).toBeInTheDocument()
        expect(screen.getByText("Configuration · Sales Copilot")).toBeInTheDocument()
        expect(screen.getByText("Runtime is provisioned.")).toBeInTheDocument()
    })

    it("shows the empty notice only on the permitted empty state and a limitation otherwise", () => {
        const empty = projectAgentOSShellView(reading([identity, runtime, attention, inventoryOf([])]), labels)
        const { unmount } = render(<AgentOSWorkspaceControlCenterBase {...baseProps} shell={empty} />)
        expect(screen.getByText("No module is installed.")).toBeInTheDocument()
        expect(screen.getByText("The observation is complete and authorized.")).toBeInTheDocument()
        unmount()
        const limited = projectAgentOSShellView(
            reading([identity, runtime, attention, inventoryOf([], { state: "partial", completeness: "partial" })]),
            labels,
        )
        render(<AgentOSWorkspaceControlCenterBase {...baseProps} shell={limited} />)
        expect(screen.queryByText("No module is installed.")).toBeNull()
        expect(screen.getByText("The module list was only observed in part.")).toBeInTheDocument()
    })

    it("clears the private scope and offers no tab on a refused access", () => {
        const refused = projectAgentOSShellView(
            reading([identity, sourceObservation({ kind: "installation_inventory" }, "refused")]),
            labels,
        )
        render(<AgentOSWorkspaceControlCenterBase {...baseProps} shell={refused} />)
        expect(screen.getByText("Current access is not permitted.")).toBeInTheDocument()
        expect(screen.queryByText("Sales Copilot")).toBeNull()
        expect(screen.getByRole("heading", { level: 1, name: "AgentOS workspace" })).toBeInTheDocument()
    })

    it("offers a real anchor to sign in, and a real button to retry a failed verification", () => {
        const signIn = projectAgentOSShellView(
            { session: "sign-in-required", sessionStatus: "anonymous", sources: [] },
            labels,
        )
        const { unmount } = render(<AgentOSWorkspaceControlCenterBase {...baseProps} shell={signIn} />)
        expect(screen.getByRole("link", { name: "Sign in" }).getAttribute("href")).toBe("/authentication")
        unmount()
        const unverified = projectAgentOSShellView(
            reading([
                sourceObservation({ kind: "core_registry" }, "unavailable"),
                sourceObservation({ kind: "installation_inventory" }, "unavailable"),
                sourceObservation({ kind: "runtime" }, "unavailable"),
            ]),
            labels,
        )
        const retry = vi.fn()
        render(<AgentOSWorkspaceControlCenterBase {...baseProps} shell={unverified} onRetryShell={retry} />)
        screen.getByRole("button", { name: "Retry" }).click()
        expect(retry).toHaveBeenCalled()
    })

    it("keeps the aggregate tabs above the connected overview and never a second main landmark", () => {
        const html = renderToStaticMarkup(
            <AgentOSWorkspaceControlCenterBase
                {...baseProps}
                shell={projectAgentOSShellView(reading([identity, runtime, attention, inventoryOf([])]), labels)}
            />,
        )
        expect(html).toContain("Installed modules")
        expect(html).toContain("No module is installed.")
        expect(html).not.toContain("<main")
    })
})
