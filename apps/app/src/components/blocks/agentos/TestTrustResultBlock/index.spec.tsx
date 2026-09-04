import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
import { buildModulePageCopy } from "@/components/pages/AgentOSSolutionModulePage/component"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import type { AgentosModuleTestAssertionResult, AgentosModuleTestContract, AgentosModuleTestRun } from "@/modules/api/console"
import { TestTrustResultBlock as ActualTestTrustResultBlock } from "."

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
        expect(html).toContain("Result: Passed")
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
type TestTrustResultBlockFixtureProps = Omit<ComponentProps<typeof ActualTestTrustResultBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const TestTrustResultBlockCopyFixture = (props: TestTrustResultBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualTestTrustResultBlock {...props} copy={buildModulePageCopy(t)} />
}
const TestTrustResultBlock = ({ locale = "en", ...props }: TestTrustResultBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><TestTrustResultBlockCopyFixture {...props} /></NextIntlClientProvider>

describe.each(["en", "vi"] as const)("Trust evidence copy %s", locale => {
 it.each(["running", "passed", "warning", "failed"] as const)("renders %s without changing assertions", status => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime
  const html = renderToStaticMarkup(<TestTrustResultBlock locale={locale} contract={contract} run={{ ...run, status }} assertions={[assertion()]} contextLabel="Raw context" />)
  expect(html).toContain(copy.testStatus[status])
  expect(html).toContain(copy.trust.verdictPass)
  expect(html).toContain("verify the contract")
 })
})

describe.each(["en", "vi"] as const)("Trust summary branches %s", locale => {
 it.each(["warning", "fail"] as const)("renders the persisted %s verdict and structured evidence", verdict => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.trust
  const html = renderToStaticMarkup(<TestTrustResultBlock locale={locale} contract={contract} run={{ ...run, summary: { total: 23, pass: "17", warning: null } }} assertions={[{ ...assertion(), verdict, expected: null, actual: [1, true] }]} contextLabel="Raw digest" />)
  expect(html).toContain(verdict === "warning" ? copy.verdictWarning : copy.verdictFail)
  expect(html).toContain("[1,true]")
  expect(html).toContain("—")
  expect(html).toMatch(/>23</u)
  expect(html).toMatch(/>17</u)
  expect(html.match(/>0</gu)).toHaveLength(2)
 })
 it("distinguishes no run from missing registered evidence", () => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.trust
  const empty = renderToStaticMarkup(<TestTrustResultBlock locale={locale} contract={contract} run={null} assertions={[]} contextLabel="Raw digest" />)
  expect(empty).toContain(copy.notRun)
  expect(empty).toContain(copy.collect)
  expect(empty).toContain(copy.noRun)
  const rejected = renderToStaticMarkup(<TestTrustResultBlock locale={locale} contract={contract} run={run} assertions={[assertion()]} contextLabel="Raw digest" registry={{}} />)
  expect(rejected).toContain(copy.rejected)
  expect(rejected).not.toContain("verify the contract")
 })
})
