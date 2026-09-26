import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { projectAgentOSShellView, type AgentOSShellReading, type AgentOSWorkspaceControlCenterShellLabels } from "@/components/blocks/agentos/AgentOSWorkspaceControlCenter/component"
import type { ShellSourceIdentity } from "@/modules/api/agentos-shell"
import type { ShellSourceObservation, ShellSourceStanding } from "@/modules/agentos/shell-observation-store"
import { AgentOSModuleCollectionPageBase } from "./component"
import { MODULE_COLLECTION_GRID_CLASS_NAME, MODULE_COLLECTION_PAGE_CLASS_NAME } from "./classNames"

const labels = {
    path: "Breadcrumb",
    workspace: "Acme workspace",
    title: "Modules",
    checkedAt: "List checked at {time}",
    installedIn: "Installed in {name}",
    browseCatalog: "View available modules",
    installFlow: "Go to the dedicated install flow",
    runtimeLine: "Runtime: {value}",
    runtimeProvisioned: "Provisioned",
    runtimeNotProvisioned: "Not provisioned",
    runtimeUnavailable: "Unavailable",
    runtimeUnknown: "Not established"
}

const shellLabels: AgentOSWorkspaceControlCenterShellLabels = {
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
    configurationCurrent: "desired {desired} · tested {tested} · applied {applied}",
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
    installEntry: "Install module"
}

const sourceObservation = (identity: ShellSourceIdentity, state: ShellSourceStanding, payload: Readonly<Record<string, unknown>> | null = null, extra: Partial<ShellSourceObservation> = {}): ShellSourceObservation => ({
    identity,
    readGeneration: 1,
    state,
    availability: state === "available" || state === "partial" ? "available" : null,
    freshness: state === "available" || state === "partial" ? "current" : null,
    completeness: state === "available" || state === "partial" ? "complete" : null,
    observedAt: "2026-09-26T03:00:00.000Z",
    payload,
    ...extra
})

const row = (installationId: string, moduleKey: string, displayName: string, status: string) => ({ installationId, moduleKey, displayName, status })

const reading = (sources: ReadonlyArray<ShellSourceObservation>): AgentOSShellReading => ({ session: "established", sessionStatus: "signed-in", sources })

const identity = sourceObservation({ kind: "core_registry" }, "available", { workspaceId: "workspace-1", instanceId: "instance-1", name: "Acme AgentOS", runtimeAvailability: "provisioned" })
const runtime = sourceObservation({ kind: "runtime" }, "available", { runtimeGeneration: "gen-1", runtimeAvailability: "provisioned" })
const runtimeAbsent = sourceObservation({ kind: "runtime" }, "available", { runtimeGeneration: null, runtimeAvailability: "not_provisioned" })
const attention = sourceObservation({ kind: "attention", installationId: "installation-1" }, "unsupported")
const inventory = (installations: ReadonlyArray<Readonly<Record<string, unknown>>>, extra: Partial<ShellSourceObservation> = {}) => sourceObservation({ kind: "installation_inventory" }, "available", { installations }, extra)
const receipt = (queueState: string, kinds: ReadonlyArray<string> = []) => sourceObservation(
    { kind: "receiver", installationId: "installation-1", intentId: "intent-1" },
    "available",
    { commandId: "c-1", receiverInstallationId: "installation-1", queueState, attempt: 1, possibleStartAt: null, observations: kinds.map((kind, index) => ({ observationId: `o-${index}`, kind, observedAt: `2026-09-26T03:0${index}:00.000Z` })), localTransportGaps: [] }
)

const renderPage = (shell: ReturnType<typeof projectAgentOSShellView>, onRetryShell = vi.fn()) => {
    const back = vi.fn()
    const view = render(<AgentOSModuleCollectionPageBase workspaceId="workspace-1" shell={shell} shellLabels={shellLabels} labels={labels} formatDate={value => value} createHref="/en/agentos/workspaces/workspace-1/modules/create" onBack={back} onRetryShell={onRetryShell}/>)
    return { back, view, onRetryShell }
}

describe("AgentOSModuleCollectionPageBase", () => {
    it("names the collection region and shows every actual installation of one package as its own entry", () => {
        const shell = projectAgentOSShellView(reading([identity, runtime, attention, inventory([row("installation-1", "sales-copilot", "Sales Copilot", "installed"), row("installation-2", "sales-copilot", "Sales Copilot EU", "installed")])]), shellLabels)
        renderPage(shell)
        expect(screen.getByRole("region", { name: labels.title })).toBeTruthy()
        expect(screen.getByText("Sales Copilot")).toBeInTheDocument()
        expect(screen.getByText("Sales Copilot EU")).toBeInTheDocument()
        expect(screen.getByText(/sales-copilot · installed · installation-1/)).toBeInTheDocument()
        expect(screen.getByText(/sales-copilot · installed · installation-2/)).toBeInTheDocument()
    })

    it("keeps the compact module heading and the inventory's own checked-at statement above the regions", () => {
        const shell = projectAgentOSShellView(reading([identity, runtime, attention, inventory([row("installation-1", "sales-copilot", "Sales Copilot", "installed")])]), shellLabels)
        renderPage(shell)
        expect(screen.getByRole("heading", { level: 1, name: "Modules" })).toBeTruthy()
        expect(screen.getByText("List checked at 2026-09-26T03:00:00.000Z")).toBeInTheDocument()
        expect(screen.queryByRole("link", { name: /create/i })).toBeNull()
    })

    it("discloses no workspace, installation or count while no session is signed in", () => {
        const shell = projectAgentOSShellView({ session: "sign-in-required", sessionStatus: "anonymous", sources: [identity, inventory([row("installation-1", "sales-copilot", "Sales Copilot", "installed")])] }, shellLabels)
        renderPage(shell)
        expect(screen.queryByText("Sales Copilot")).toBeNull()
        expect(screen.queryByText(/installation-1/)).toBeNull()
        expect(screen.queryByText("Acme AgentOS")).toBeNull()
        expect(screen.getByRole("link", { name: shellLabels.signInAction }).getAttribute("href")).toBe("/authentication")
    })

    it("renders a limitation instead of an empty or all-ready list when the observation is partial", () => {
        const shell = projectAgentOSShellView(reading([identity, runtime, attention, inventory([], { state: "partial", completeness: "partial" })]), shellLabels)
        const retry = renderPage(shell).onRetryShell
        expect(screen.queryByText(shellLabels.inventoryEmpty)).toBeNull()
        expect(screen.getByText(shellLabels.inventoryLimitPartial)).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: shellLabels.retry }))
        expect(retry).toHaveBeenCalled()
    })

    it("centres one dominant card carrying the empty notice and its install entry in the same surface", () => {
        const shell = projectAgentOSShellView(reading([identity, runtimeAbsent, attention, inventory([])]), shellLabels)
        expect(shell.state).toBe("no-runtime")
        expect(shell.inventoryEmpty).toBe(true)
        const { view } = renderPage(shell)
        const inventoryRegion = view.container.querySelector("[data-region='module-inventory']")
        const card = inventoryRegion?.querySelector("[data-grammar-surface-composition='joined']")
        expect(card).not.toBeNull()
        // The empty notice and the next step live inside the same joined surface, message first.
        const notice = card?.querySelector("[data-component='EmptyNotice']")
        const entry = card?.querySelector("[data-region='install-entry']")
        expect(notice).not.toBeNull()
        expect(entry).not.toBeNull()
        expect((notice?.compareDocumentPosition(entry ?? notice) ?? 0) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0)
        expect(screen.getByText(shellLabels.inventoryEmpty)).toBeInTheDocument()
        expect(screen.getByText("Installed in Acme AgentOS")).toBeInTheDocument()
        const browse = screen.getByRole("link", { name: labels.browseCatalog })
        expect(browse.getAttribute("href")).toBe("/en/agentos/workspaces/workspace-1/modules/create")
        expect(screen.getByRole("link", { name: labels.installFlow }).getAttribute("href")).toBe("/en/agentos/workspaces/workspace-1/modules/create")
        expect(screen.getByText("Runtime: Not provisioned")).toBeInTheDocument()
    })

    it("never shows the joined empty card or its entry affordance when the inventory carries rows", () => {
        const shell = projectAgentOSShellView(reading([identity, runtime, attention, inventory([row("installation-1", "sales-copilot", "Sales Copilot", "installed")])]), shellLabels)
        renderPage(shell)
        expect(screen.queryByText(shellLabels.inventoryEmpty)).toBeNull()
        expect(screen.queryByRole("link", { name: labels.browseCatalog })).toBeNull()
    })

    it("shows a returned operation's own receipt beside the ledger without claiming a result early", () => {
        const shell = projectAgentOSShellView(reading([identity, runtime, attention, inventory([row("installation-1", "sales-copilot", "Sales Copilot", "installed")]), receipt("claimed", ["progress"])]), shellLabels)
        expect(shell.state).toBe("operation-pending")
        renderPage(shell)
        expect(screen.getByText(shellLabels.resultPending)).toBeInTheDocument()
        expect(screen.getByText(/installation-1 · intent-1 · c-1/)).toBeInTheDocument()
        expect(screen.queryByText(shellLabels.resultConfirmed)).toBeNull()
        expect(screen.getByText("Sales Copilot")).toBeInTheDocument()
    })

    it("keeps the resolved rhythm on the page and collection owners without a second main landmark", () => {
        const shell = projectAgentOSShellView(reading([identity, runtime, attention, inventory([])]), shellLabels)
        const { view } = renderPage(shell)
        const page = view.container.querySelector("[data-contract='GAP-5']")
        const collection = view.container.querySelector("[data-contract='GAP-4']")
        expect(page?.className).toBe(MODULE_COLLECTION_PAGE_CLASS_NAME)
        expect(collection?.className).toBe(MODULE_COLLECTION_GRID_CLASS_NAME)
        expect(view.container.querySelector("main")).toBeNull()
    })
})
