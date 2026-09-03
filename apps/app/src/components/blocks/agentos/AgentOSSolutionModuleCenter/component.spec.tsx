import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSSolutionModuleCenterBase, type AgentOSSolutionModuleLedgerProps } from "./component"
import { SOLUTION_CATALOG_GRID_CLASS_NAME, SOLUTION_LEDGER_ROWS_CLASS_NAME } from "./classNames"

const base = { sectionLabel: "Solutions", modesLabel: "Mode", modes: [{ id: "catalog" as const, label: "Catalog" }, { id: "installed" as const, label: "Installed" }], refusedLabel: "Unavailable", emptyLabel: "No modules", emptyActionLabel: "Browse catalog", onSelectMode: vi.fn(), onPressCard: vi.fn() }
const card = { id: "sales", title: "Sales Copilot", description: "Assist sales", statusLabel: "Ready", statusTone: "success" as const, actionLabel: "Install" }
const row = { id: "install-1", name: "Knowledge Hub", detail: "Version 1.0.0", kind: "Installed", status: "Ready", statusTone: "success" as const, action: "View details", href: "/en/agentos/workspaces/w/modules/install-1" }
const ledger = (over: Partial<AgentOSSolutionModuleLedgerProps> = {}): AgentOSSolutionModuleLedgerProps => ({
    installedLabel: "Installed solutions",
    catalogLabel: "Nivo solutions",
    installedState: "ready",
    catalogueState: "ready",
    installedRows: [row],
    installedEmptyTitle: "No solution installed yet",
    installedEmpty: "Installing a package adds it here.",
    installedRefusedTitle: "Installed solutions could not be read",
    installedRefused: "The catalogue below remains available.",
    catalogueEmptyTitle: "No solution package is available",
    catalogueEmpty: "Nivo publishes packages to this catalogue.",
    catalogueRefusedTitle: "The catalogue could not be read",
    catalogueRefused: "Your own modules above are unaffected.",
    retry: "Try again",
    retryingInstalled: false,
    retryingCatalogue: false,
    onRetryInstalled: vi.fn(),
    onRetryCatalogue: vi.fn(),
    ...over,
})

describe("AgentOS solution module center", () => {
    it("renders refusal and empty installed states in the tabs form", () => {
        const refused = renderToStaticMarkup(<AgentOSSolutionModuleCenterBase {...base} state="refused" mode="catalog" cards={[]} />)
        expect(refused).toContain("Unavailable")
        expect(refused).not.toContain("Retry")
        expect(renderToStaticMarkup(<AgentOSSolutionModuleCenterBase {...base} state="answered" mode="installed" cards={[]} />)).toContain("No modules")
    })

    it("renders pending catalog cards and outcomes", () => {
        const html = renderToStaticMarkup(<AgentOSSolutionModuleCenterBase {...base} state="answered" mode="catalog" cards={[card]} pendingId="sales" outcome="Started" />)
        expect(html).toContain("Sales Copilot")
        expect(html).toContain("Started")
    })

    it("lists installed solutions as anchor rows above the catalogue grid in the ledger form", () => {
        const { container } = render(<AgentOSSolutionModuleCenterBase {...base} layout="ledger" ledger={ledger()} state="answered" mode="catalog" cards={[card]} outcome="Started" />)
        expect(screen.getByRole("link", { name: "Knowledge Hub" }).getAttribute("href")).toBe(row.href)
        expect(screen.getByRole("link", { name: "View details" }).getAttribute("href")).toBe(row.href)
        expect(screen.getByText("Sales Copilot")).toBeTruthy()
        expect(screen.getByText("Started")).toBeTruthy()
        expect(screen.queryByRole("radio")).toBeNull()
        expect(container.querySelector("[data-contract='BOUNDARY-3']")?.className).toBe(SOLUTION_LEDGER_ROWS_CLASS_NAME)
        expect(container.querySelector("[data-contract='GAP-4']")?.className).toBe(SOLUTION_CATALOG_GRID_CLASS_NAME)
    })

    it("keeps the ledger shape while resting", () => {
        const resting = renderToStaticMarkup(<AgentOSSolutionModuleCenterBase {...base} layout="ledger" ledger={ledger({ installedState: "resting", catalogueState: "resting", installedRows: [] })} state="resting" mode="catalog" cards={[]} />)
        expect(resting.split("data-contract=\"GAP-1\"").length - 1).toBe(2)
    })

    it("states each absence with its own title and line, in the section it belongs to", () => {
        const html = renderToStaticMarkup(<AgentOSSolutionModuleCenterBase {...base} layout="ledger" ledger={ledger({ installedState: "empty", catalogueState: "empty", installedRows: [] })} state="answered" mode="catalog" cards={[]} />)
        expect(html).toContain("No solution installed yet")
        expect(html).toContain("Installing a package adds it here.")
        expect(html).toContain("No solution package is available")
        expect(html).not.toContain("Try again")
    })

    it("recovers a refused section from that section alone, with pending on its own action", () => {
        const onRetryInstalled = vi.fn()
        const onRetryCatalogue = vi.fn()
        render(<AgentOSSolutionModuleCenterBase {...base} layout="ledger" ledger={ledger({ installedState: "refused", catalogueState: "refused", installedRows: [], onRetryInstalled, onRetryCatalogue })} state="refused" mode="catalog" cards={[]} />)
        expect(screen.getByText("Installed solutions could not be read")).toBeTruthy()
        expect(screen.getByText("The catalogue could not be read")).toBeTruthy()
        const retries = screen.getAllByRole("button", { name: "Try again" })
        expect(retries).toHaveLength(2)
        fireEvent.click(retries[0])
        fireEvent.click(retries[1])
        expect(onRetryInstalled).toHaveBeenCalledTimes(1)
        expect(onRetryCatalogue).toHaveBeenCalledTimes(1)
        const pending = renderToStaticMarkup(<AgentOSSolutionModuleCenterBase {...base} layout="ledger" ledger={ledger({ installedState: "refused", catalogueState: "ready", installedRows: [], retryingInstalled: true })} state="refused" mode="catalog" cards={[card]} />)
        expect(pending).toContain("aria-busy=\"true\"")
    })

    it("keeps a refused catalogue from hiding an answered installed section", () => {
        render(<AgentOSSolutionModuleCenterBase {...base} layout="ledger" ledger={ledger({ catalogueState: "refused" })} state="refused" mode="catalog" cards={[]} />)
        expect(screen.getByRole("link", { name: "Knowledge Hub" })).toBeTruthy()
        expect(screen.getByText("The catalogue could not be read")).toBeTruthy()
    })
})
