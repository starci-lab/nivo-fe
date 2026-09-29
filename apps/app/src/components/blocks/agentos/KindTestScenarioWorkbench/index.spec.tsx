import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { AgentosModuleTestContract } from "../../../../modules/api/agentos-module-tests"
import type { KindTestWorkbenchBlockCopy, TestWorkbenchComponentProps } from "../../../../modules/agentos/kind-test-workbench"
import { KindTestScenarioWorkbench } from "."

const copy: KindTestWorkbenchBlockCopy = {
    kindTest: {
        accounting: "Accounting fixture test",
        boundary: "Boundary",
        boundaryDetail: ({ scenario, context, count, picker, commands }) => `${scenario} · ${context} · ${count} · ${picker} · ${commands}`,
        calendar: "Calendar sandbox test",
        citation: "Citation grounding test",
        closed: "Closed",
        cockpit: "Cockpit",
        default: "Default workbench",
        context: "Context",
        sandbox: "Sandbox",
        fakeHint: "Fake input only",
        safety: "No live channels are called.",
        run: ({ scenario }) => `Run ${scenario}`,
        scenario: "Scenario",
        state: "State",
        conversation: "Conversation test",
        generic: "Generic test",
        local: "Local",
        noRegistration: "No trusted registration",
        pending: "Pending",
        ready: "Ready",
        refused: "Refused",
        runUnavailable: "Test cannot run",
        unavailable: "Test workbench unavailable",
    },
}
const contract: AgentosModuleTestContract = {
    workbench: { key: "conversation-sandbox", version: "1.0.0" },
    contract: { key: "contract", version: "1.0.0" },
    sandboxAdapter: { key: "declarative-scenario", version: "1.0.0" },
    evidenceWidget: { key: "nivo.test-evidence", version: "1.0.0" },
    scenarios: [
        { key: "safe", label: "Safe fixture", description: "Fake value", fixture: { value: "seed" }, assertions: [] },
    ],
}
const props: TestWorkbenchComponentProps = {
    copy,
    contract,
    scenario: contract.scenarios[0]!,
    contextLabel: "Context v1",
    pending: false,
    showScenarioPicker: true,
    overrides: {},
    onSelectScenario: vi.fn(),
    onOverride: vi.fn(),
    onRun: vi.fn(),
}

describe("KindTestScenarioWorkbench", () => {
    it("shows fixture inputs and emits parsed overrides", () => {
        render(<KindTestScenarioWorkbench {...props} />)
        expect(screen.getByRole("heading", { name: "Conversation test" })).toBeInTheDocument()
        const input = screen.getByRole("textbox", { name: "value" })
        fireEvent.change(input, { target: { value: "owner input" } })
        expect(props.onOverride).toHaveBeenCalledWith("value", "owner input")
    })
})
