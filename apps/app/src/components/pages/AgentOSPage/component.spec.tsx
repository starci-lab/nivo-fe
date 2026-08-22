import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/agentos/AgentOSWorkspaceList", () => ({
    AgentOSWorkspaceList: () => <div>Workspace list</div>,
}))
vi.mock("@/components/blocks/provisioning/AgentOSProvisioning", () => ({
    AgentOSProvisioning: () => <div>Provisioning</div>,
}))

import { AgentOSPageBase } from "./component"

describe("AgentOSPage", () => {
    it("keeps the shallow path above the page title with the current step inert", () => {
        const html = renderToStaticMarkup(<AgentOSPageBase
            mode="new"
            path={{ label: "Console path", overviewLabel: "Overview", currentLabel: "AgentOS" }}
            onOpenOverview={vi.fn()}
        />)

        expect(html).toContain('data-component="Breadcrumbs"')
        expect(html).toContain('aria-current="page"')
        expect(html.indexOf('data-component="Breadcrumbs"')).toBeLessThan(html.indexOf("<h1"))
    })
})
