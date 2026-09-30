import { render } from "@testing-library/react"
import type { ModulePageCopy } from "@/modules/agentos/module-page-copy"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import { AgentOSSolutionModuleState } from "./component"
import { AgentOSModuleRoutePage } from "./index"

const copy = {
    studioPage: { title: "Module" },
    shell: { loading: "Loading module", reading: "Reading module", refused: "Request refused", unavailable: "Unavailable" },
    pageTest: { state: "Status" },
} as ModulePageCopy

describe("AgentOSModuleRoutePage", () => {
    it("exports its connected route owner", () => {
        expect(AgentOSModuleRoutePage).toBeTypeOf("function")
    })

    it("has no axe violations while the runtime is loading", async () => {
        const { container } = render(<AgentOSSolutionModuleState copy={copy} refused={false} />)
        await expectNoA11yViolations(container)
    })
})
