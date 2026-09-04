import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
import { buildModulePageCopy } from "@/components/pages/AgentOSSolutionModulePage/component"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import type { AgentosModuleTestContract } from "@/modules/api/console"
import { DEFAULT_TEST_WORKBENCH_REGISTRY, KindTestWorkbenchBlock as ActualKindTestWorkbenchBlock } from "."

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
type KindTestWorkbenchBlockFixtureProps = Omit<ComponentProps<typeof ActualKindTestWorkbenchBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const KindTestWorkbenchBlockCopyFixture = (props: KindTestWorkbenchBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualKindTestWorkbenchBlock {...props} copy={buildModulePageCopy(t)} />
}
const KindTestWorkbenchBlock = ({ locale = "en", ...props }: KindTestWorkbenchBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><KindTestWorkbenchBlockCopyFixture {...props} /></NextIntlClientProvider>

describe.each(["en", "vi"] as const)("Kind test copy %s", locale => {
 it.each(["conversation-sandbox", "accounting-fixture", "calendar-sandbox", "citation-check", "generic-sandbox", "missing"])("renders %s with its real fixture and fail-closed fallback", workbenchKey => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.kindTest
  const html = renderToStaticMarkup(<KindTestWorkbenchBlock locale={locale} contract={contractFor(workbenchKey)} contextLabel="Untranslated context" targetReady pending={false} registry={DEFAULT_TEST_WORKBENCH_REGISTRY} onRun={vi.fn()} />)
  expect(html).toContain(workbenchKey === "missing" ? copy.unavailable : "Safe fixture")
  expect(html).toContain(workbenchKey === "missing" ? copy.closed : copy.fakeHint)
 })
})
