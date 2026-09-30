import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AgentOSInstallationChromeBase } from "./component"
import { AgentOSInstallationChrome } from "./index"

describe("AgentOSInstallationChrome", () => {
    it("exports its connected route owner", () => {
        expect(AgentOSInstallationChrome).toBeTypeOf("function")
    })

    it("has no axe violations", async () => {
        const { container } = render(
            <AgentOSInstallationChromeBase
                props={{
                    modulesLabel: "Modules",
                    sectionsLabel: "Sections",
                    groups: [],
                    selectedKey: "install-1",
                    selectedTab: "setup",
                    tabs: [{ id: "setup", label: "Setup" }],
                }}
                on={{ activate: vi.fn(), selectTab: vi.fn() }}
            >
                <div>Module setup</div>
            </AgentOSInstallationChromeBase>,
        )
        await expectNoA11yViolations(container)
    })
})
