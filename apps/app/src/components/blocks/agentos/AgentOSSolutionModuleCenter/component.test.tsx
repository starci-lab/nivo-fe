import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSSolutionModuleCenterBase } from "./component"

const base = { sectionLabel: "Solutions", modesLabel: "Mode", modes: [{ id: "catalog" as const, label: "Catalog" }, { id: "installed" as const, label: "Installed" }], refusedLabel: "Unavailable", emptyLabel: "No modules", emptyActionLabel: "Browse catalog", onSelectMode: vi.fn(), onPressCard: vi.fn() }
const card = { id: "sales", title: "Sales Copilot", description: "Assist sales", statusLabel: "Ready", statusTone: "success" as const, actionLabel: "Install" }

describe("AgentOS solution module center", () => {
    it("renders refusal and empty installed states", () => {
        expect(renderToStaticMarkup(<AgentOSSolutionModuleCenterBase {...base} state="refused" mode="catalog" cards={[]} />)).toContain("Unavailable")
        expect(renderToStaticMarkup(<AgentOSSolutionModuleCenterBase {...base} state="answered" mode="installed" cards={[]} />)).toContain("No modules")
    })

    it("renders pending catalog cards and outcomes", () => {
        const html = renderToStaticMarkup(<AgentOSSolutionModuleCenterBase {...base} state="answered" mode="catalog" cards={[card]} pendingId="sales" outcome="Started" />)
        expect(html).toContain("Sales Copilot")
        expect(html).toContain("Started")
    })
})
