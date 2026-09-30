import { createTranslator } from "next-intl"
import { render } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import enMessages from "../../../../messages/en.json"
import { TestSurface } from "."
import type { AgentosModuleTestContract } from "../../../../modules/api/agentos-module-tests"
import { buildModulePageCopy } from "../../../../modules/agentos/module-page-copy"
import type { TestSurfaceProps } from "../../../../modules/agentos/module-page/surface-types"
import { TIME_ZONE } from "@/modules/i18n"

const copy = buildModulePageCopy(
    createTranslator({
        locale: "en",
        messages: enMessages,
        namespace: "console.agentos.modules",
        timeZone: TIME_ZONE,
        onError: (error) => {
            throw error
        },
    }),
)
const contract: AgentosModuleTestContract = {
    workbench: { key: "conversation-sandbox", version: "1.0.0" },
    contract: { key: "conversation-test", version: "1.0.0" },
    sandboxAdapter: { key: "declarative-scenario", version: "1.0.0" },
    evidenceWidget: { key: "nivo.test-evidence", version: "1.0.0" },
    scenarios: [
        { key: "urgent-support", label: "Urgent support", description: "Uses fake data", fixture: {}, assertions: [] },
    ],
}
const props: TestSurfaceProps = {
    contract,
    targetReady: true,
    contextLabel: "Context v1",
    testSurface: null,
    pending: false,
    selectedScenarioKey: "urgent-support",
    mode: "exploratory",
    compactPane: "conversation",
    onSelectScenario: vi.fn(),
    onSelectMode: vi.fn(),
    onSelectPane: vi.fn(),
    onRun: vi.fn(),
}

describe("TestSurface", () => {
    it("has no axe violations for the real current test surface", async () => {
        const { container } = render(<TestSurface copy={copy} {...props} />)

        await expectNoA11yViolations(container)
    })

    it("renders the current test scenario and its evidence pane", () => {
        const html = renderToStaticMarkup(<TestSurface copy={copy} {...props} />)

        expect(html).toContain("Urgent support")
        expect(html).toContain(copy.pageTest.evidence)
        expect(html).toContain("Context v1")
    })
})
