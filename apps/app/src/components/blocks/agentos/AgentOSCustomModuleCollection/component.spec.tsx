import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSCustomModuleCollectionBase } from "./component"
import { MODULE_LEDGER_ROW_CLASS_NAME, MODULE_LEDGER_ROWS_CLASS_NAME } from "./classNames"

const base = {
    title: "Custom modules",
    emptyTitle: "No custom module yet",
    empty: "Create module above starts the interview.",
    refusedTitle: "Custom modules could not be read",
    refused: "The catalogue below remains available.",
    retry: "Try again",
    retrying: false,
    onRetry: vi.fn(),
}
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

    it("states absence as a title and one line, and offers no action of its own", () => {
        render(<AgentOSCustomModuleCollectionBase {...base} state="empty" rows={[]} />)
        expect(screen.getByText(base.emptyTitle)).toBeTruthy()
        expect(screen.getByText(base.empty)).toBeTruthy()
        expect(screen.queryByRole("button")).toBeNull()
    })

    it("states a refusal as a title and one line, and recovers that read from its own section", () => {
        const onRetry = vi.fn()
        render(<AgentOSCustomModuleCollectionBase {...base} state="refused" rows={[]} onRetry={onRetry} />)
        expect(screen.getByText(base.refusedTitle)).toBeTruthy()
        expect(screen.getByText(base.refused)).toBeTruthy()
        fireEvent.click(screen.getByRole("button", { name: base.retry }))
        expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it("carries the pending of a retry on the action that started it", () => {
        const html = renderToStaticMarkup(<AgentOSCustomModuleCollectionBase {...base} state="refused" rows={[]} retrying={true} />)
        expect(html).toContain("aria-busy=\"true\"")
    })
})
