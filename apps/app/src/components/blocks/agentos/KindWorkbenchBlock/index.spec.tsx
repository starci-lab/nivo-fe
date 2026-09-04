import type { AgentosRuntimeTask, AgentosRuntimeOperationEvent } from "@/modules/api/console"
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


describe.each(["en", "vi"] as const)("Workbench persisted branches %s", locale => {
 const task: AgentosRuntimeTask = { id: "task/raw", installationId: "installation/raw", sourceEventId: "event/raw", contextVersionId: "context/raw", title: "Owner task", summary: "Raw summary", priority: "high", status: "in_progress", expectedVersion: 7, workbenchKey: "calendar-week", workbenchVersion: "1.0.0", workbenchRef: "reference/raw", evidence: {}, dueAt: "2026-08-26T12:30:00.000Z", createdAt: "2026-08-26T00:00:00.000Z", updatedAt: "2026-08-26T00:00:00.000Z" }
 const event: AgentosRuntimeOperationEvent = { id: "event/raw", installationId: "installation/raw", contextVersionId: "context/raw", source: "raw-source", externalEventId: "external/raw", eventType: "raw-event", observedAt: "2026-08-26T00:00:00.000Z", kindKey: "raw-kind", kindVersion: "1.0.0", replyContractKey: "reply/raw", replyContractVersion: "1.0.0", toolSchemaDigest: "raw-digest", payload: {}, evidence: {}, createdAt: "2026-08-26T00:00:00.000Z" }
 it.each(["support-queue", "accounting-sheet", "calendar-week", "document-reader"])("renders active tasks and excludes completed work in %s", workbenchKey => {
  const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.workbench
  const props = { locale, moduleId: "installation/raw", kindKey: "raw-kind", workbenchKey, workbenchVersion: "1.0.0", registry: DEFAULT_WORKBENCH_REGISTRY }
  const html = renderToStaticMarkup(<KindWorkbenchBlock {...props} tasks={[{ ...task, id: "completed", title: "Completed excluded", status: "completed" }, task, { ...task, id: "normal", status: "open", priority: "normal" }]} events={[event]} />)
  expect(html).toContain("Owner task")
  expect(html).not.toContain("Completed excluded")
  expect(html).toMatch(/>2</u)
  if (workbenchKey === "support-queue") expect(html).toContain("raw-source")
  if (workbenchKey === "calendar-week") expect(html).toContain(new Date(task.dueAt!).toLocaleString())
  const empty = renderToStaticMarkup(<KindWorkbenchBlock {...props} tasks={[]} events={[]} />)
  const emptyLabel = workbenchKey === "support-queue" ? copy.clear : workbenchKey === "accounting-sheet" ? copy.noApprovals : workbenchKey === "calendar-week" ? copy.noMeeting : copy.noAnswer
  expect(empty).toContain(emptyLabel)
  if (workbenchKey === "calendar-week") {
   const unscheduled = renderToStaticMarkup(<KindWorkbenchBlock {...props} tasks={[{ ...task, dueAt: null }]} />)
   expect(unscheduled).toContain(copy.notScheduled)
  }
 })
})
