import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AgentOSWorkspaceModuleList } from "./index"

type ModuleListHookProps = { readonly workspaceId: string }

const moduleCenter = vi.hoisted(() => ({
    workspaceId: null as string | null,
    view: {
        layout: "tabs",
        mode: "catalog",
        catalogReading: { status: "ready", data: [] },
        installationsReading: { status: "ready", data: [] },
        catalogCards: [],
        installedCards: [],
        installedRows: [],
        pendingKey: undefined,
        outcome: undefined,
        isCatalogValidating: false,
        isInstallationsValidating: false,
        isResting: false,
        refresh: vi.fn(),
        refreshCatalog: vi.fn(),
        refreshInstallations: vi.fn(),
        onPressCard: vi.fn(),
        setMode: vi.fn(),
        catalogState: "empty",
        installationsState: "empty",
        copy: {
            available: "Available",
            installedCount: (count: number) => `${count} installed`,
            catalogDetail: () => "Catalogue module",
            install: "Install",
            installedDescription: "Installed modules",
            status: (status: string) => status,
            version: (version: string) => `Version ${version}`,
            viewDetails: "View details",
            installed: "Installed",
            catalogSection: "Catalogue",
            installedSection: "Installed modules",
            modesLabel: "Module view",
            catalogMode: "Catalogue",
            installedMode: "Installed",
            empty: "No modules",
            browse: "Browse",
            emptyTitle: "No installed modules",
            emptyHint: "Browse available modules",
            catalogueEmptyTitle: "Nothing available",
            catalogueEmptyHint: "Try again later",
            installedEmptyAction: "Browse the catalogue",
        },
    },
}))

vi.mock("@/hooks/agentos/useAgentOSSolutionModuleCenter", () => ({
    useAgentOSSolutionModuleCenter: (props: ModuleListHookProps) => {
        moduleCenter.workspaceId = props.workspaceId
        return moduleCenter.view
    },
}))

describe("AgentOSWorkspaceModuleList", () => {
    it("keeps the real module screen scoped to the selected workspace", async () => {
        const { container } = render(<AgentOSWorkspaceModuleList workspaceId="workspace-1" />)

        expect(moduleCenter.workspaceId).toBe("workspace-1")
        expect(screen.getByRole("radio", { name: "Installed" })).toBeInTheDocument()
        expect(screen.getByText("No modules")).toBeInTheDocument()
        await expectNoA11yViolations(container)
    })
})
