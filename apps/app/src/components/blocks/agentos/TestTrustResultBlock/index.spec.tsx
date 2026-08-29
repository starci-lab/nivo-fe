import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import type { AgentosModuleTestAssertionResult, AgentosModuleTestContract, AgentosModuleTestRun } from "@/modules/api/console"
import { TestTrustResultBlock } from "."

const contract: AgentosModuleTestContract = {
    workbench: { key: "conversation-sandbox", version: "1.0.0" },
    contract: { key: "conversation-test", version: "1.0.0" },
    sandboxAdapter: { key: "declarative-scenario", version: "1.0.0" },
    evidenceWidget: { key: "nivo.test-evidence", version: "1.0.0" },
    scenarios: [],
}

const run: AgentosModuleTestRun = {
    id: "run-1", installationId: "installation-1", moduleDefinitionId: "definition-1", contextVersionId: "context-2",
    setupSessionId: null, draftDigest: null,
    requestedByUserId: "owner-1", kindKey: "customer-support", kindVersion: "1.0.0",
    testContractKey: "conversation-test", testContractVersion: "1.0.0", scenarioKey: "support-conversation",
    status: "passed", scenarioInput: {}, summary: { total: 1, pass: 1, warning: 0, fail: 0 },
    completedAt: "2026-08-25T00:00:01.000Z", createdAt: "2026-08-25T00:00:00.000Z",
}

const assertion = (component = "nivo.test-evidence"): AgentosModuleTestAssertionResult => ({
    id: "assertion-1", runId: "run-1", ordinal: 1, assertionKey: "acknowledges", label: "Acknowledges before acting",
    verdict: "pass", expected: "verify", actual: "verify the contract", createdAt: "2026-08-25T00:00:01.000Z",
    evidence: { component, version: "1.0.0", props: { status: "pass", summary: "Acknowledges", assertions: [] } },
})

describe("TestTrustResultBlock", () => {
    it("renders persisted assertion evidence through the trusted registration", () => {
        const html = renderToStaticMarkup(<TestTrustResultBlock contract={contract} run={run} assertions={[assertion()]} contextLabel="Context v2 · candidate" />)
        expect(html).toContain("Result: passed")
        expect(html).toContain("Acknowledges before acting")
        expect(html).toContain("verify the contract")
        expect(html).not.toContain("Untrusted evidence rejected")
    })

    it("rejects a component identity outside the trusted evidence contract", () => {
        const html = renderToStaticMarkup(<TestTrustResultBlock contract={contract} run={run} assertions={[assertion("arbitrary.html")]} contextLabel="Context v2" />)
        expect(html).toContain("Untrusted evidence rejected")
        expect(html).not.toContain("verify the contract")
    })
})