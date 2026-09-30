import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AgentOSModuleCreatePageBase } from "./component"
import { AgentOSModuleCreatePage } from "./index"

vi.mock("@/components/blocks/agentos/AgentOSModuleIntake", () => ({
    AgentOSModuleIntake: () => <div>Module intake</div>,
}))

describe("AgentOSModuleCreatePage", () => {
    it("exports its connected route owner", () => {
        expect(AgentOSModuleCreatePage).toBeTypeOf("function")
    })

    it("has no axe violations", async () => {
        const { container } = render(
            <AgentOSModuleCreatePageBase
                props={{
                    workspaceId: "workspace-1",
                    labels: {
                        path: "Path",
                        modules: "Modules",
                        title: "Create module",
                        description: "Describe the module",
                        eyebrow: "Custom module",
                    },
                }}
                on={{ back: vi.fn() }}
            />,
        )
        await expectNoA11yViolations(container)
    })
})
