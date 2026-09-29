import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { AgentosModuleTestContract } from "../../../../modules/api/agentos-module-tests"
import type { KindTestWorkbenchBlockCopy, TestWorkbenchComponentProps } from "../../../../modules/agentos/kind-test-workbench"
import { KindTestUnavailableWorkbench } from "."

const copy: KindTestWorkbenchBlockCopy = {
    kindTest: {
        accounting: "Accounting",
        boundary: "Boundary",
        boundaryDetail: ({ scenario, context, count, picker, commands }) => `${scenario} · ${context} · ${count} · ${picker} · ${commands}`,
        calendar: "Calendar",
        citation: "Citation",
        closed: "No test was executed",
        cockpit: "Cockpit",
        context: "Context",
        conversation: "Conversation",
        default: "Default",
        fakeHint: "Fake inputs only",
        generic: "Generic",
        local: "Local",
        noRegistration: "No trusted registration",
        pending: "Pending",
        ready: "Ready",
        refused: "Refused",
        run: ({ scenario }) => `Run ${scenario}`,
        runUnavailable: "Test cannot run",
        safety: "Safety",
        sandbox: "Sandbox",
        scenario: "Scenario",
        state: "State",
        unavailable: "Test workbench unavailable",
    },
}
const contract: AgentosModuleTestContract = {
    workbench: { key: "unregistered", version: "1.0.0" },
    contract: { key: "contract", version: "1.0.0" },
    sandboxAdapter: { key: "declarative-scenario", version: "1.0.0" },
    evidenceWidget: { key: "nivo.test-evidence", version: "1.0.0" },
    scenarios: [{ key: "safe", label: "Safe", description: "Fake", fixture: {}, assertions: [] }],
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

describe("KindTestUnavailableWorkbench", () => {
    it("explains the refusal and disables the run action", () => {
        render(<KindTestUnavailableWorkbench {...props} />)
        expect(screen.getByText("No test was executed")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Test cannot run" })).toBeDisabled()
    })
})
