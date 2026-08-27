import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { AgentosModuleTestContract } from "@/modules/api/console"
import { DEFAULT_TEST_WORKBENCH_REGISTRY, KindTestWorkbenchBlock } from "."

const contractFor = (workbenchKey: string): AgentosModuleTestContract => ({
    workbench: { key: workbenchKey, version: "1.0.0" },
    contract: { key: `${workbenchKey}-contract`, version: "1.0.0" },
    sandboxAdapter: { key: "declarative-scenario", version: "1.0.0" },
    evidenceWidget: { key: "nivo.test-evidence", version: "1.0.0" },
    scenarios: [{
        key: "safe-fixture",
        label: "Safe fixture",
        description: "Fake input only",
        fixture: { value: "fixture" },
        assertions: [{ key: "present", label: "Value is present", source: "input", path: "value", operator: "present", severity: "fail" }],
    }],
})

describe("KindTestWorkbenchBlock", () => {
    it.each([
        ["conversation-sandbox", "Conversation test"],
        ["accounting-fixture", "Accounting fixture test"],
        ["calendar-sandbox", "Calendar sandbox test"],
        ["citation-check", "Citation grounding test"],
    ])("resolves trusted Test workbench %s", (workbenchKey, expectedTitle) => {
        const html = renderToStaticMarkup(
            <KindTestWorkbenchBlock
                contract={contractFor(workbenchKey)}
                contextLabel="Context v2 · candidate"
                targetReady
                pending={false}
                registry={DEFAULT_TEST_WORKBENCH_REGISTRY}
                onRun={vi.fn()}
            />,
        )
        expect(html).toContain(expectedTitle)
        expect(html).toContain("Fake input only")
        expect(html).toContain("cannot call live channels")
    })

    it("fails closed for an unregistered workbench", () => {
        const html = renderToStaticMarkup(
            <KindTestWorkbenchBlock
                contract={contractFor("untrusted-workbench")}
                contextLabel="Context v1"
                targetReady
                pending={false}
                registry={DEFAULT_TEST_WORKBENCH_REGISTRY}
                onRun={vi.fn()}
            />,
        )
        expect(html).toContain("Test workbench unavailable")
        expect(html).toContain("no test was executed")
    })
})
