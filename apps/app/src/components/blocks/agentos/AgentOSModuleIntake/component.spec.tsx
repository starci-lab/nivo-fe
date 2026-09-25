import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AgentOSModuleIntakeBase } from "./component"

describe("AgentOSModuleIntakeBase", () => {
    it("draws upload lifecycle and adaptive intake without source requests", () => {
        const intake = renderToStaticMarkup(<AgentOSModuleIntakeBase
            goal="Collect customer requirements"
            pending={false}
            title="Start a module"
            description="Describe the outcome"
            fieldLabel="Goal"
            placeholder="What should this module learn?"
            note="Saved to this workspace"
            action="Start interview"
            guideTitle="How it works"
            guideSteps={["Set the goal", "Answer follow-ups", "Review the result"]}
            guideNote="The agent asks only for missing facts."
            onGoal={vi.fn()}
            onSubmit={vi.fn()}
        />)
        expect(intake).toContain("Start interview")
        expect(intake).toContain("Answer follow-ups")
    })
})