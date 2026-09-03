import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSSolutionModuleCenterBase } from "./component"
import { SOLUTION_CATALOG_GRID_CLASS_NAME, SOLUTION_LEDGER_ROWS_CLASS_NAME } from "./classNames"

const base = { sectionLabel: "Solutions", modesLabel: "Mode", modes: [{ id: "catalog" as const, label: "Catalog" }, { id: "installed" as const, label: "Installed" }], refusedLabel: "Unavailable", emptyLabel: "No modules", emptyActionLabel: "Browse catalog", onSelectMode: vi.fn(), onPressCard: vi.fn() }
const card = { id: "sales", title: "Sales Copilot", description: "Assist sales", statusLabel: "Ready", statusTone: "success" as const, actionLabel: "Install" }
const ledger = { ...base, layout: "ledger" as const, installedLabel: "Installed solutions", catalogLabel: "Nivo solutions" }
const row = { id: "install-1", name: "Knowledge Hub", detail: "Version 1.0.0", kind: "Installed", status: "Ready", statusTone: "success" as const, action: "View details", href: "/en/agentos/workspaces/w/modules/install-1" }

describe("AgentOS solution module center", () => {
    it("renders refusal and empty installed states", () => {
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
        const { container } = render(<AgentOSSolutionModuleCenterBase {...ledger} state="answered" mode="catalog" cards={[card]} installedRows={[row]} outcome="Started" />)
        expect(screen.getByRole("link", { name: "Knowledge Hub" }).getAttribute("href")).toBe(row.href)
        expect(screen.getByRole("link", { name: "View details" }).getAttribute("href")).toBe(row.href)
        expect(screen.getByText("Sales Copilot")).toBeTruthy()
        expect(screen.getByText("Started")).toBeTruthy()
        expect(screen.queryByRole("radio")).toBeNull()
        expect(container.querySelector("[data-contract='BOUNDARY-3']")?.className).toBe(SOLUTION_LEDGER_ROWS_CLASS_NAME)
        expect(container.querySelector("[data-contract='GAP-4']")?.className).toBe(SOLUTION_CATALOG_GRID_CLASS_NAME)
    })

    it("keeps the ledger shape while resting, and states absence and refusal without a second action", () => {
        const resting = renderToStaticMarkup(<AgentOSSolutionModuleCenterBase {...ledger} state="resting" mode="catalog" cards={[]} installedRows={[]} />)
        expect(resting.split("data-contract=\"GAP-1\"").length - 1).toBe(2)
        const empty = renderToStaticMarkup(<AgentOSSolutionModuleCenterBase {...ledger} state="answered" mode="catalog" cards={[card]} installedRows={[]} />)
        expect(empty).toContain("No modules")
        expect(empty).not.toContain("Browse catalog")
        const refused = renderToStaticMarkup(<AgentOSSolutionModuleCenterBase {...ledger} state="refused" mode="catalog" cards={[]} installedRows={[]} />)
        expect(refused.split("Unavailable").length - 1).toBe(2)
        expect(refused).not.toContain("<button")
    })
})
