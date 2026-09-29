import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"
import { AgentOSModuleCollectionPageBase } from "./component"
import { MODULE_COLLECTION_GRID_CLASS_NAME, MODULE_COLLECTION_PAGE_CLASS_NAME } from "./classNames"

type PageProps = ComponentProps<typeof AgentOSModuleCollectionPageBase>
type ShellView = PageProps["props"]["shell"]
type ShellLabels = PageProps["props"]["shellLabels"]

const labels = {
    path: "Breadcrumb",
    workspace: "Acme workspace",
    title: "Modules",
    browseCatalog: "View available modules",
    installFlow: "Go to the dedicated install flow",
    runtimeProvisioned: "Provisioned",
    runtimeNotProvisioned: "Not provisioned",
    runtimeUnavailable: "Unavailable",
    runtimeUnknown: "Not established",
}

const shellLabels: ShellLabels = {
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

const OBSERVED_AT = "2026-09-26T03:00:00.000Z"

const installation = (
    installationId: string,
    moduleKey: string,
    displayName: string,
    status: string,
): ShellView["installations"][number] => ({ installationId, moduleKey, displayName, status, configuration: null })

/** The settled shell view the connected owner already produced, overridden per state under test. */
const shellView = (overrides: Partial<ShellView> = {}): ShellView => ({
    state: "installed-current",
    workspaceId: "workspace-1",
    instanceId: "instance-1",
    name: "Acme AgentOS",
    identityObservedAt: OBSERVED_AT,
    inventoryStanding: "current",
    inventoryObservedAt: OBSERVED_AT,
    inventoryEmpty: false,
    runtimeStanding: "current",
    runtimeAvailability: "provisioned",
    runtimeGeneration: "gen-1",
    runtimeObservedAt: OBSERVED_AT,
    installations: [],
    attentionStanding: "unsupported",
    attentionObservedAt: OBSERVED_AT,
    operations: [],
    retrying: false,
    ...overrides,
})

const renderPage = (shell: ShellView, onRetryShell = vi.fn()) => {
    const back = vi.fn()
    const view = render(
        <AgentOSModuleCollectionPageBase
            props={{
                workspaceId: "workspace-1",
                shell,
                shellLabels,
                labels,
                createHref: "/en/agentos/workspaces/workspace-1/modules/create",
            }}
            on={{
                onBack: back,
                onRetryShell,
                formatDate: (value) => value,
                checkedAt: (time) => `List checked at ${time}`,
                installedIn: (name) => `Installed in ${name}`,
                runtimeLine: (value) => `Runtime: ${value}`,
                formatConfiguration: ({ desired, tested, applied }) =>
                    `desired ${desired} · tested ${tested} · applied ${applied}`,
            }}
        />,
    )
    return { back, view, onRetryShell }
}

describe("AgentOSModuleCollectionPageBase", () => {
    it("names the collection region and shows every actual installation of one package as its own entry", () => {
        const shell = shellView({
            installations: [
                installation("installation-1", "sales-copilot", "Sales Copilot", "installed"),
                installation("installation-2", "sales-copilot", "Sales Copilot EU", "installed"),
            ],
        })
        renderPage(shell)
        expect(screen.getByRole("region", { name: labels.title })).toBeTruthy()
        expect(screen.getByText("Sales Copilot")).toBeInTheDocument()
        expect(screen.getByText("Sales Copilot EU")).toBeInTheDocument()
        expect(screen.getByText(/sales-copilot · installed · installation-1/)).toBeInTheDocument()
        expect(screen.getByText(/sales-copilot · installed · installation-2/)).toBeInTheDocument()
    })

    it("keeps the compact module heading and the inventory's own checked-at statement above the regions", () => {
        const shell = shellView({
            installations: [installation("installation-1", "sales-copilot", "Sales Copilot", "installed")],
        })
        renderPage(shell)
        expect(screen.getByRole("heading", { level: 1, name: "Modules" })).toBeTruthy()
        expect(screen.getByText("List checked at 2026-09-26T03:00:00.000Z")).toBeInTheDocument()
        expect(screen.queryByRole("link", { name: /create/i })).toBeNull()
    })

    it("discloses no workspace, installation or count while no session is signed in", () => {
        const shell = shellView({
            state: "sign-in-required",
            workspaceId: null,
            instanceId: null,
            name: null,
            identityObservedAt: null,
            runtimeStanding: "unresolved",
            runtimeAvailability: null,
            runtimeGeneration: null,
            runtimeObservedAt: null,
            attentionStanding: "unresolved",
            attentionObservedAt: null,
        })
        renderPage(shell)
        expect(screen.queryByText("Sales Copilot")).toBeNull()
        expect(screen.queryByText(/installation-1/)).toBeNull()
        expect(screen.queryByText("Acme AgentOS")).toBeNull()
        expect(screen.getByRole("link", { name: shellLabels.signInAction }).getAttribute("href")).toBe(
            "/authentication",
        )
    })

    it("renders a limitation instead of an empty or all-ready list when the observation is partial", () => {
        const shell = shellView({ state: "evidence-limited", inventoryStanding: "partial" })
        const retry = renderPage(shell).onRetryShell
        expect(screen.queryByText(shellLabels.inventoryEmpty)).toBeNull()
        expect(screen.getByText(shellLabels.inventoryLimitPartial)).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: shellLabels.retry }))
        expect(retry).toHaveBeenCalled()
    })

    it("centres one dominant card carrying the empty notice and its install entry in the same surface", () => {
        const shell = shellView({
            state: "no-runtime",
            inventoryEmpty: true,
            runtimeAvailability: "not_provisioned",
            runtimeGeneration: null,
        })
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
        expect(screen.getByRole("link", { name: labels.installFlow }).getAttribute("href")).toBe(
            "/en/agentos/workspaces/workspace-1/modules/create",
        )
        expect(screen.getByText("Runtime: Not provisioned")).toBeInTheDocument()
    })

    it("never shows the joined empty card or its entry affordance when the inventory carries rows", () => {
        const shell = shellView({
            installations: [installation("installation-1", "sales-copilot", "Sales Copilot", "installed")],
        })
        renderPage(shell)
        expect(screen.queryByText(shellLabels.inventoryEmpty)).toBeNull()
        expect(screen.queryByRole("link", { name: labels.browseCatalog })).toBeNull()
    })

    it("shows a returned operation's own receipt beside the ledger without claiming a result early", () => {
        const shell = shellView({
            state: "operation-pending",
            installations: [installation("installation-1", "sales-copilot", "Sales Copilot", "installed")],
            operations: [
                {
                    installationId: "installation-1",
                    intentId: "intent-1",
                    commandId: "c-1",
                    receiverName: "Sales Copilot",
                    standing: "pending",
                    observedAt: OBSERVED_AT,
                },
            ],
        })
        renderPage(shell)
        expect(screen.getByText(shellLabels.resultPending)).toBeInTheDocument()
        expect(screen.getByText(/installation-1 · intent-1 · c-1/)).toBeInTheDocument()
        expect(screen.queryByText(shellLabels.resultConfirmed)).toBeNull()
        expect(screen.getByText("Sales Copilot")).toBeInTheDocument()
    })

    it("keeps the resolved rhythm on the page and collection owners without a second main landmark", () => {
        const shell = shellView({ state: "installed-empty", inventoryEmpty: true })
        const { view } = renderPage(shell)
        const page = view.container.querySelector("[data-contract='GAP-5']")
        const collection = view.container.querySelector("[data-contract='GAP-4']")
        expect(page?.className).toBe(MODULE_COLLECTION_PAGE_CLASS_NAME)
        expect(collection?.className).toBe(MODULE_COLLECTION_GRID_CLASS_NAME)
        expect(view.container.querySelector("main")).toBeNull()
    })
})
