import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { AgentOSSolutionModuleCard } from "../../../../modules/agentos/solution-module-center"
import { AgentOSSolutionModuleCatalogGrid } from "."

const card: AgentOSSolutionModuleCard = {
    id: "knowledge-hub",
    title: "Knowledge Hub",
    description: "Organize evidence",
    statusLabel: "Available",
    statusTone: "neutral",
    actionLabel: "Install",
}

describe("AgentOSSolutionModuleCatalogGrid", () => {
    it("emits the selected card identity", () => {
        const onPressCard = vi.fn()
        render(<AgentOSSolutionModuleCatalogGrid cards={[card]} loading={false} onPressCard={onPressCard} />)
        expect(screen.getByText("Knowledge Hub")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Install" }))
        expect(onPressCard).toHaveBeenCalledExactlyOnceWith("knowledge-hub")
    })
})
