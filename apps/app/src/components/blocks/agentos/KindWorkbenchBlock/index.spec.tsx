import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/i18n/config"
import { buildModulePageCopy } from "@/components/pages/AgentOSSolutionModulePage/component"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { DEFAULT_WORKBENCH_REGISTRY, KindWorkbenchBlock as ActualKindWorkbenchBlock } from "."

describe("KindWorkbenchBlock", () => {
    it.each([
        ["support-queue", "Support queue"],
        ["accounting-sheet", "Accounting sheet"],
        ["calendar-week", "Calendar week"],
        ["document-reader", "Document reader"],
    ])("resolves trusted workbench %s", (workbenchKey, expectedTitle) => {
        const html = renderToStaticMarkup(
            <KindWorkbenchBlock
                moduleId="installation-1"
                kindKey="open-kind"
                workbenchKey={workbenchKey}
                workbenchVersion="1.0.0"
                registry={DEFAULT_WORKBENCH_REGISTRY}
            />,
        )
        expect(html).toContain(expectedTitle)
        expect(html).not.toContain("No registered workbench")
    })

    it("projects durable tasks into the kind workbench instead of static queue claims", () => {
        const html = renderToStaticMarkup(
            <KindWorkbenchBlock
                moduleId="installation-1"
                kindKey="customer-support"
                workbenchKey="support-queue"
                workbenchVersion="1.0.0"
                tasks={[{
                    id: "task-1", installationId: "installation-1", sourceEventId: "event-1", contextVersionId: "context-1",
                    title: "Customer follow-up overdue", summary: "Waiting", priority: "urgent", status: "open", expectedVersion: 1,
                    workbenchKey: "support-queue", workbenchVersion: "1.0.0", workbenchRef: "ticket-1", evidence: {}, dueAt: null,
                    createdAt: "2026-08-26T00:00:00.000Z", updatedAt: "2026-08-26T00:00:00.000Z",
                }]}
                events={[]}
                registry={DEFAULT_WORKBENCH_REGISTRY}
            />,
        )
        expect(html).toContain("Customer follow-up overdue")
        expect(html).toContain("High / urgent")
        expect(html).not.toContain("#4821")
    })
})
type KindWorkbenchBlockFixtureProps = Omit<ComponentProps<typeof ActualKindWorkbenchBlock>, "copy"> & { readonly locale?: "en" | "vi" }
const KindWorkbenchBlockCopyFixture = (props: KindWorkbenchBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualKindWorkbenchBlock {...props} copy={buildModulePageCopy(t)} />
}
const KindWorkbenchBlock = ({ locale = "en", ...props }: KindWorkbenchBlockFixtureProps) => <NextIntlClientProvider locale={locale} messages={locale === "en" ? enMessages : viMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><KindWorkbenchBlockCopyFixture {...props} /></NextIntlClientProvider>

describe.each(["en", "vi"] as const)("Workbench copy %s", locale => {
 it.each(["support-queue", "accounting-sheet", "calendar-week", "document-reader", "sales-pipeline", "conversation-inbox", "generic-workbench", "missing"])("keeps %s registration identity while translating its title", workbenchKey => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.workbench
  const html = renderToStaticMarkup(<KindWorkbenchBlock locale={locale} moduleId="raw-module" kindKey="raw-kind" workbenchKey={workbenchKey} workbenchVersion="1.0.0" registry={DEFAULT_WORKBENCH_REGISTRY} />)
  expect(html).toContain(copy.title)
  expect(html).toContain(workbenchKey + "@1.0.0")
  if (workbenchKey === "missing") expect(html).toContain(copy.unavailableNotice)
 })
})
