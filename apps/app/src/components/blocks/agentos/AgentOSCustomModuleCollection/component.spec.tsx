import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AgentOSCustomModuleCollectionBase } from "./component"
import { MODULE_LEDGER_ROW_CLASS_NAME, MODULE_LEDGER_ROWS_CLASS_NAME } from "./classNames"

const base = { title: "Custom modules", refused: "Unavailable", empty: "No modules" }
const rows = [
    { id: "draft", name: "Partner guide", detail: "40% complete", kind: "Custom", status: "Needs input", active: false, action: "Resume interview", href: "/en/agentos/workspaces/w/modules/studio/draft" },
    { id: "live", name: "Sales copilot", detail: "100% complete", kind: "Custom", status: "Active", active: true, action: "View module", href: "/en/agentos/workspaces/w/modules/install-1" },
]

describe("AgentOSCustomModuleCollectionBase", () => {
    it("renders every row as a ledger line whose name and action are anchors to the same destination", () => {
        const { container } = render(<AgentOSCustomModuleCollectionBase {...base} state="ready" rows={rows} />)
        expect(screen.getByRole("link", { name: "Partner guide" }).getAttribute("href")).toBe(rows[0].href)
        expect(screen.getByRole("link", { name: "Resume interview" }).getAttribute("href")).toBe(rows[0].href)
        expect(screen.getByRole("link", { name: "View module" }).getAttribute("href")).toBe(rows[1].href)
        expect(screen.getByText("Needs input")).toBeTruthy()
        expect(container.querySelector("[data-contract='BOUNDARY-3']")?.className).toBe(MODULE_LEDGER_ROWS_CLASS_NAME)
        expect(container.querySelectorAll("[data-contract='GAP-3 PADDING-4 PADDING-3']")).toHaveLength(2)
        expect(container.querySelector("[data-contract='GAP-3 PADDING-4 PADDING-3']")?.className).toBe(MODULE_LEDGER_ROW_CLASS_NAME)
    })

    it("keeps the same list shape while the read is unresolved, with three resting rows", () => {
        const html = renderToStaticMarkup(<AgentOSCustomModuleCollectionBase {...base} state="loading" rows={[]} />)
        expect(html.split("data-contract=\"GAP-1\"").length - 1).toBe(3)
        expect(html).toContain("Custom modules")
    })

    it("states absence and refusal inside the section with no action of their own", () => {
        const empty = renderToStaticMarkup(<AgentOSCustomModuleCollectionBase {...base} state="empty" rows={[]} />)
        const refused = renderToStaticMarkup(<AgentOSCustomModuleCollectionBase {...base} state="refused" rows={[]} />)
        expect(empty).toContain("No modules")
        expect(refused).toContain("Unavailable")
        expect(empty).not.toContain("<button")
        expect(refused).not.toContain("<button")
    })
})
