import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AgentOSModuleStudioPageBase } from "./component"
import { AgentOSModuleStudioPage } from "./index"

vi.mock("@/components/blocks/agentos/AgentOSModuleAttachments", () => ({
    AgentOSModuleAttachments: () => <div>Attachments</div>,
}))
vi.mock("@/components/blocks/agentos/AgentOSModuleInterview", () => ({
    AgentOSModuleInterview: () => <div>Interview</div>,
}))
vi.mock("@/components/blocks/agentos/AgentOSModuleProfile", () => ({
    AgentOSModuleProfile: () => <div>Profile</div>,
}))
vi.mock("@/components/blocks/agentos/AgentOSModuleSpecification", () => ({
    AgentOSModuleSpecification: () => <div>Specification</div>,
}))

describe("AgentOSModuleStudioPage", () => {
    it("exports its connected route owner", () => {
        expect(AgentOSModuleStudioPage).toBeTypeOf("function")
    })

    it("has no axe violations", async () => {
        const { container } = render(
            <AgentOSModuleStudioPageBase
                props={{
                    workspaceId: "workspace-1",
                    moduleId: "module-1",
                    labels: {
                        path: "Path",
                        modules: "Modules",
                        title: "Module studio",
                        description: "Configure the module",
                        eyebrow: "Custom module",
                        sections: "Sections",
                    },
                }}
                on={{ back: vi.fn() }}
            />,
        )
        await expectNoA11yViolations(container)
    })
})
