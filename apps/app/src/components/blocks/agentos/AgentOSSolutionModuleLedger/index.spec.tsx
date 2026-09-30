import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import type { AgentOSSolutionModuleLedgerProps } from "../../../../modules/agentos/solution-module-center"
import { AgentOSSolutionModuleLedger } from "."

const ledger: AgentOSSolutionModuleLedgerProps = {
    installedLabel: "Installed",
    catalogLabel: "Catalogue",
    installedState: "empty",
    catalogueState: "ready",
    installedRows: [],
    installedEmptyTitle: "No installed modules",
    installedEmpty: "Browse available modules",
    catalogueEmptyTitle: "Nothing available",
    catalogueEmpty: "Try again later",
    installedEmptyAction: "Browse the catalogue",
}

describe("AgentOSSolutionModuleLedger", () => {
    it("moves the reader to the catalogue and focuses its region", async () => {
        const { container } = render(<AgentOSSolutionModuleLedger ledger={ledger} cards={[]} onPressCard={vi.fn()} />)
        const region = document.querySelector<HTMLElement>("[data-region='module-catalogue']")
        expect(region).not.toBeNull()
        if (region === null) return
        region.scrollIntoView = vi.fn()
        fireEvent.click(screen.getByRole("button", { name: "Browse the catalogue" }))
        expect(region.scrollIntoView).toHaveBeenCalled()
        expect(document.activeElement).toBe(region)
        await expectNoA11yViolations(container)
    })
})
