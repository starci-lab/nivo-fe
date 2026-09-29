import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import {
    AgentOSSolutionModuleCenterBase as AgentOSSolutionModuleCenterBaseView,
    type AgentOSSolutionModuleCenterViewProps,
    type AgentOSSolutionModuleLedgerProps,
} from "./component"
import { SOLUTION_CATALOG_GRID_CLASS_NAME, SOLUTION_LEDGER_ROWS_CLASS_NAME } from "./classNames"

const AgentOSSolutionModuleCenterBase = (view: AgentOSSolutionModuleCenterViewProps) => {
    const { state, onSelectMode, onPressCard, ...data } = view
    return (
        <AgentOSSolutionModuleCenterBaseView
            state={state}
            props={data}
            on={{
                onSelectMode,
                onPressCard,
            }}
        />
    )
}

const base = {
    sectionLabel: "Solutions",
    modesLabel: "Mode",
    modes: [
        { id: "catalog" as const, label: "Catalog" },
        { id: "installed" as const, label: "Installed" },
    ],
    emptyLabel: "No modules",
    emptyActionLabel: "Browse catalog",
    onSelectMode: vi.fn(),
    onPressCard: vi.fn(),
}
const card = {
    id: "sales",
    title: "Sales Copilot",
    description: "Assist sales",
    statusLabel: "Ready",
    statusTone: "success" as const,
    actionLabel: "Install",
}
const row = {
    id: "install-1",
    name: "Knowledge Hub",
    detail: "Version 1.0.0",
    kind: "Installed",
    status: "Ready",
    statusTone: "success" as const,
    action: "View details",
    href: "/en/agentos/workspaces/w/modules/install-1",
}
const ledger = (over: Partial<AgentOSSolutionModuleLedgerProps> = {}): AgentOSSolutionModuleLedgerProps => ({
    installedLabel: "Installed solutions",
    catalogLabel: "Nivo solutions",
    installedState: "ready",
    catalogueState: "ready",
    installedRows: [row],
    installedEmptyTitle: "No solution installed yet",
    installedEmpty: "Installing a package adds it here.",
    catalogueEmptyTitle: "No solution package is available",
    catalogueEmpty: "Nivo publishes packages to this catalogue.",
    installedEmptyAction: "Browse the catalogue",
    ...over,
})

describe("AgentOSSolutionModuleCenterBase", () => {
    it("renders failure and empty installed states in the tabs form", () => {
        const failed = renderToStaticMarkup(
            <AgentOSSolutionModuleCenterBase
                {...base}
                state="failed"
                mode="catalog"
                cards={[]}
                notice={<div>Unavailable</div>}
            />,
        )
        expect(failed).toContain("Unavailable")
        expect(failed).not.toContain("Retry")
        expect(
            renderToStaticMarkup(
                <AgentOSSolutionModuleCenterBase {...base} state="answered" mode="installed" cards={[]} />,
            ),
        ).toContain("No modules")
    })

    it("sends an empty installed view back to the catalogue, and installs from the ledger catalogue", () => {
        const onSelectMode = vi.fn()
        const onPressCard = vi.fn()
        render(
            <AgentOSSolutionModuleCenterBase
                {...base}
                state="answered"
                mode="installed"
                cards={[]}
                onSelectMode={onSelectMode}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: base.emptyActionLabel }))
        expect(onSelectMode).toHaveBeenCalledWith("catalog")
        render(
            <AgentOSSolutionModuleCenterBase
                {...base}
                layout="ledger"
                ledger={ledger()}
                state="answered"
                mode="catalog"
                cards={[card]}
                onPressCard={onPressCard}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: card.actionLabel }))
        expect(onPressCard).toHaveBeenCalledWith(card.id)
    })

    it("renders pending catalog cards and outcomes", () => {
        const html = renderToStaticMarkup(
            <AgentOSSolutionModuleCenterBase
                {...base}
                state="answered"
                mode="catalog"
                cards={[card]}
                pendingId="sales"
                outcome="Started"
            />,
        )
        expect(html).toContain("Sales Copilot")
        expect(html).toContain("Started")
    })

    it("lists installed solutions as anchor rows above the catalogue grid in the ledger form", () => {
        const { container } = render(
            <AgentOSSolutionModuleCenterBase
                {...base}
                layout="ledger"
                ledger={ledger()}
                state="answered"
                mode="catalog"
                cards={[card]}
                outcome="Started"
            />,
        )
        expect(screen.getByRole("link", { name: "Knowledge Hub" }).getAttribute("href")).toBe(row.href)
        expect(screen.getByRole("link", { name: "View details" }).getAttribute("href")).toBe(row.href)
        expect(screen.getByText("Sales Copilot")).toBeTruthy()
        expect(screen.getByText("Started")).toBeTruthy()
        expect(screen.queryByRole("radio")).toBeNull()
        expect(container.querySelector("[data-contract='BOUNDARY-3']")?.className).toBe(SOLUTION_LEDGER_ROWS_CLASS_NAME)
        expect(container.querySelector("[data-contract='GAP-4']")?.className).toBe(SOLUTION_CATALOG_GRID_CLASS_NAME)
    })

    it("keeps the ledger shape while resting", () => {
        const resting = renderToStaticMarkup(
            <AgentOSSolutionModuleCenterBase
                {...base}
                layout="ledger"
                ledger={ledger({ installedState: "resting", catalogueState: "resting", installedRows: [] })}
                state="resting"
                mode="catalog"
                cards={[]}
            />,
        )
        expect(resting.split('data-contract="GAP-1"').length - 1).toBe(2)
    })

    it("states each absence with its own title and line, in the section it belongs to", () => {
        const html = renderToStaticMarkup(
            <AgentOSSolutionModuleCenterBase
                {...base}
                layout="ledger"
                ledger={ledger({ installedState: "empty", catalogueState: "empty", installedRows: [] })}
                state="answered"
                mode="catalog"
                cards={[]}
            />,
        )
        expect(html).toContain("No solution installed yet")
        expect(html).toContain("Installing a package adds it here.")
        expect(html).toContain("No solution package is available")
        expect(html).toContain("Browse the catalogue")
        expect(html).not.toContain("Try again")
    })

    it("recovers a failed section from the notice that section draws", () => {
        const onRetryInstalled = vi.fn()
        const onRetryCatalogue = vi.fn()
        render(
            <AgentOSSolutionModuleCenterBase
                {...base}
                layout="ledger"
                ledger={ledger({
                    installedState: "failed",
                    catalogueState: "failed",
                    installedRows: [],
                    installedNotice: <button onClick={onRetryInstalled}>Try again</button>,
                    catalogueNotice: <button onClick={onRetryCatalogue}>Try again</button>,
                })}
                state="failed"
                mode="catalog"
                cards={[]}
            />,
        )
        const retries = screen.getAllByRole("button", { name: "Try again" })
        expect(retries).toHaveLength(2)
        fireEvent.click(retries[0]!)
        fireEvent.click(retries[1]!)
        expect(onRetryInstalled).toHaveBeenCalledTimes(1)
        expect(onRetryCatalogue).toHaveBeenCalledTimes(1)
        const pending = renderToStaticMarkup(
            <AgentOSSolutionModuleCenterBase
                {...base}
                layout="ledger"
                ledger={ledger({
                    installedState: "failed",
                    catalogueState: "ready",
                    installedRows: [],
                    installedNotice: (
                        <button aria-busy="true" onClick={onRetryInstalled}>
                            Try again
                        </button>
                    ),
                })}
                state="failed"
                mode="catalog"
                cards={[card]}
            />,
        )
        expect(pending).toContain('aria-busy="true"')
    })

    it("sends an empty installed section to the catalogue beneath it", () => {
        render(
            <AgentOSSolutionModuleCenterBase
                {...base}
                layout="ledger"
                ledger={ledger({ installedState: "empty", installedRows: [] })}
                state="answered"
                mode="catalog"
                cards={[card]}
            />,
        )
        const region = document.querySelector("[data-region='module-catalogue']") as HTMLElement
        expect(region).toBeTruthy()
        region.scrollIntoView = vi.fn()
        fireEvent.click(screen.getByRole("button", { name: "Browse the catalogue" }))
        expect(region.scrollIntoView).toHaveBeenCalled()
        expect(document.activeElement).toBe(region)
    })

    it("keeps a failed catalogue from hiding an answered installed section", () => {
        render(
            <AgentOSSolutionModuleCenterBase
                {...base}
                layout="ledger"
                ledger={ledger({
                    catalogueState: "failed",
                    catalogueNotice: <div>The catalogue could not be read</div>,
                })}
                state="failed"
                mode="catalog"
                cards={[]}
            />,
        )
        expect(screen.getByRole("link", { name: "Knowledge Hub" })).toBeTruthy()
        expect(screen.getByText("The catalogue could not be read")).toBeTruthy()
    })
})

describe("AgentOSSolutionModuleCenterBase", () => {
    it("fires integration, lead, student, and solution actions", () => {
        const selectMode = vi.fn()
        const pressCard = vi.fn()
        render(
            <AgentOSSolutionModuleCenterBase
                state="answered"
                mode="catalog"
                sectionLabel="Solutions"
                modesLabel="Mode"
                modes={[
                    { id: "catalog", label: "Catalog" },
                    { id: "installed", label: "Installed" },
                ]}
                emptyLabel="Empty"
                emptyActionLabel="Browse"
                cards={[
                    {
                        id: "sales",
                        title: "Sales",
                        description: "Assist",
                        statusLabel: "Ready",
                        statusTone: "success",
                        actionLabel: "Install",
                    },
                ]}
                onSelectMode={selectMode}
                onPressCard={pressCard}
            />,
        )
        fireEvent.click(screen.getByRole("button", { name: "Install" }))
        fireEvent.click(screen.getByRole("radio", { name: "Installed" }))
        expect(pressCard).toHaveBeenCalledWith("sales")
        expect(selectMode).toHaveBeenCalledWith("installed")
        cleanup()
        renderToStaticMarkup(
            <AgentOSSolutionModuleCenterBase
                state="resting"
                mode="installed"
                sectionLabel="Solutions"
                modesLabel="Mode"
                modes={[
                    { id: "catalog", label: "Catalog" },
                    { id: "installed", label: "Installed" },
                ]}
                emptyLabel="Empty"
                emptyActionLabel="Browse"
                cards={[]}
                onSelectMode={selectMode}
                onPressCard={pressCard}
            />,
        )
    })
})
