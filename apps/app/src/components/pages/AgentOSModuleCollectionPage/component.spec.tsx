import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

type CollectionProbeProps = { readonly workspaceId: string; readonly layout?: string }

vi.mock("@/components/blocks/agentos/AgentOSCustomModuleCollection", () => ({
    AgentOSCustomModuleCollection: ({ workspaceId }: CollectionProbeProps) => <div data-testid="custom-modules">{workspaceId}</div>,
}))

vi.mock("@/components/blocks/agentos/AgentOSSolutionModuleCenter", () => ({
    AgentOSSolutionModuleCenter: ({ workspaceId, layout }: CollectionProbeProps) => <div data-testid="solution-modules" data-layout={layout}>{workspaceId}</div>,
}))

import { AgentOSModuleCollectionPageBase } from "./component"
import { MODULE_COLLECTION_GRID_CLASS_NAME, MODULE_COLLECTION_INTRO_CLASS_NAME, MODULE_COLLECTION_PAGE_CLASS_NAME } from "./classNames"

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
    const view = render(<AgentOSModuleCollectionPageBase workspaceId="workspace-1" labels={labels} createHref="/en/agentos/workspaces/workspace-1/modules/create" onBack={back} />)
    return { back, view }
}

describe("AgentOSModuleCollectionPageBase", () => {
    it("names the collection region and passes route identity to both module collections in the ledger layout", () => {
        renderPage()
        expect(screen.getByRole("region", { name: labels.title })).toBeTruthy()
        expect(screen.getByTestId("custom-modules").textContent).toBe("workspace-1")
        expect(screen.getByTestId("solution-modules").textContent).toBe("workspace-1")
        expect(screen.getByTestId("solution-modules").dataset.layout).toBe("ledger")
    })

    it("carries the workspace identity, the collection copy and the single creation door as an anchor", () => {
        renderPage()
        expect(screen.getByRole("heading", { level: 1, name: labels.title })).toBeTruthy()
        expect(screen.getByText(labels.eyebrow)).toBeTruthy()
        expect(screen.getByText(labels.description)).toBeTruthy()
        const create = screen.getByRole("link", { name: labels.create })
        expect(create.getAttribute("href")).toBe("/en/agentos/workspaces/workspace-1/modules/create")
    })

    it("keeps the resolved rhythm on the page, intro and collection owners without a second main landmark", () => {
        const { view } = renderPage()
        const page = view.container.querySelector("[data-contract='GAP-5']")
        const intro = view.container.querySelector("[data-contract='GAP-3']")
        const collection = view.container.querySelector("[data-contract='GAP-4']")
        expect(page?.className).toBe(MODULE_COLLECTION_PAGE_CLASS_NAME)
        expect(intro?.className).toBe(MODULE_COLLECTION_INTRO_CLASS_NAME)
        expect(collection?.className).toBe(MODULE_COLLECTION_GRID_CLASS_NAME)
        expect(view.container.querySelector("main")).toBeNull()
    })
})
