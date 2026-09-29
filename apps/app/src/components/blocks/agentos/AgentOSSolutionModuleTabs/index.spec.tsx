import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type {
    AgentOSSolutionModuleCenterProps,
    AgentOSSolutionModuleCenterViewProps,
} from "@/modules/agentos/solution-module-center"
import { AgentOSSolutionModuleTabs } from "."

const view: AgentOSSolutionModuleCenterViewProps = {
    state: "answered",
    mode: "catalog",
    sectionLabel: "Catalogue",
    modesLabel: "Mode",
    modes: [
        { id: "catalog", label: "Catalogue" },
        { id: "installed", label: "Installed" },
    ],
    emptyLabel: "No modules",
    emptyActionLabel: "Browse",
    cards: [],
}
const on: AgentOSSolutionModuleCenterProps["on"] = { onSelectMode: vi.fn(), onPressCard: vi.fn() }

describe("AgentOSSolutionModuleTabs", () => {
    it("states an empty catalogue and offers the catalogue action", () => {
        render(<AgentOSSolutionModuleTabs view={view} on={on} />)
        expect(screen.getByText("No modules")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Browse" })).toBeInTheDocument()
    })
})
