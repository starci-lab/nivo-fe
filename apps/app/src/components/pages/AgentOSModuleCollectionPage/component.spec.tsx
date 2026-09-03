import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type CollectionProbeProps = { readonly workspaceId: string }

vi.mock("@/components/blocks/agentos/AgentOSCustomModuleCollection", () => ({
    AgentOSCustomModuleCollection: ({ workspaceId }: CollectionProbeProps) => <div data-testid="custom-modules">{workspaceId}</div>,
}))

vi.mock("@/components/blocks/agentos/AgentOSSolutionModuleCenter", () => ({
    AgentOSSolutionModuleCenter: ({ workspaceId }: CollectionProbeProps) => <div data-testid="solution-modules">{workspaceId}</div>,
}))

import { AgentOSModuleCollectionPageBase } from "./component"
import { MODULE_COLLECTION_GRID_CLASS_NAME, MODULE_COLLECTION_PAGE_CLASS_NAME } from "./classNames"

const labels = {
    path: "Breadcrumb",
    workspace: "Acme workspace",
    title: "Modules",
    description: "Manage the modules of this workspace",
    eyebrow: "AgentOS",
    create: "Create module",
}

const renderPage = () => {
    const back = vi.fn()
    const create = vi.fn()
    const view = render(<AgentOSModuleCollectionPageBase workspaceId="workspace-1" labels={labels} onBack={back} onCreate={create} />)
    return { back, create, view }
}

describe("AgentOSModuleCollectionPageBase", () => {
    it("names the collection region and passes route identity to both module collections", () => {
        renderPage()
        expect(screen.getByRole("region", { name: labels.title })).toBeTruthy()
        expect(screen.getByTestId("custom-modules").textContent).toBe("workspace-1")
        expect(screen.getByTestId("solution-modules").textContent).toBe("workspace-1")
    })

    it("carries the workspace identity, the collection copy and the single creation door", () => {
        renderPage()
        expect(screen.getByRole("heading", { level: 1, name: labels.title })).toBeTruthy()
        expect(screen.getByText(labels.eyebrow)).toBeTruthy()
        expect(screen.getByText(labels.description)).toBeTruthy()
        expect(screen.getByRole("button", { name: labels.create })).toBeTruthy()
    })

    it("keeps the resolved rhythm on the page and grid owners", () => {
        const { view } = renderPage()
        const page = view.container.querySelector("main")
        const grid = view.container.querySelector("[data-contract='GAP-4']")
        expect(page?.className).toContain(MODULE_COLLECTION_PAGE_CLASS_NAME)
        expect(page?.dataset.contract).toBe("GAP-5")
        expect(grid?.className).toContain(MODULE_COLLECTION_GRID_CLASS_NAME)
    })
})
