import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AgentOSWorkspaceChromeBase } from "./component"
import { AgentOSWorkspaceChrome } from "./index"

describe("AgentOSWorkspaceChrome", () => {
    it("exports its connected route owner", () => {
        expect(AgentOSWorkspaceChrome).toBeTypeOf("function")
    })

    it("has no axe violations", async () => {
        const { container } = render(
            <AgentOSWorkspaceChromeBase
                props={{
                    eyebrow: "Workspace",
                    name: "North",
                    reference: "Workspace north",
                    tabsLabel: "Workspace sections",
                    overviewLabel: "Overview",
                    modulesLabel: "Modules",
                    selectedKey: "overview",
                }}
                on={{ select: vi.fn() }}
            >
                <div>Workspace overview</div>
            </AgentOSWorkspaceChromeBase>,
        )
        await expectNoA11yViolations(container)
    })
})
