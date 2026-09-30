import { render } from "@testing-library/react"
import type { AgentosRuntimeTask, AgentosRuntimeOperationEvent } from "@/modules/api/agentos-module-runtime"
import type { ComponentProps } from "react"
import { NextIntlClientProvider, useTranslations } from "next-intl"
import enMessages from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { TIME_ZONE } from "@/modules/i18n"
import { describe, expect, it, vi } from "vitest"
vi.mock("@/components/blocks/agentos/AccountingWorkbenchBlock", () => ({
    AccountingWorkbenchBlock: () => <div>Accounting workbench</div>,
}))
vi.mock("@/components/blocks/agentos/SalesWorkbenchBlock", () => ({
    SalesWorkbenchBlock: () => <div>Sales workbench</div>,
}))
import {
    DEFAULT_WORKBENCH_REGISTRY,
    KindWorkbenchBlock as ActualKindWorkbenchBlock,
    type KindWorkbenchBlockCopy,
} from "."

type CopyTranslator = (key: string, values?: Readonly<Record<string, string | number>>) => string

/** The settled copy this block draws, resolved from the same module catalog the connected owner reads. */
const copyFor = (t: CopyTranslator): KindWorkbenchBlockCopy => ({
    workbench: {
        acceptedEvents: t("runtime.workbench.acceptedEvents"),
        accounting: t("runtime.workbench.accounting"),
        accountingNotice: t("runtime.workbench.accountingNotice"),
        blocked: t("runtime.workbench.blocked"),
        calendar: t("runtime.workbench.calendar"),
        calendarMutation: t("runtime.workbench.calendarMutation"),
        calendarNotice: t("runtime.workbench.calendarNotice"),
        channel: t("runtime.workbench.channel"),
        citations: t("runtime.workbench.citations"),
        clear: t("runtime.workbench.clear"),
        confirmation: t("runtime.workbench.confirmation"),
        due: t("runtime.workbench.due"),
        evidencePack: t("runtime.workbench.evidencePack"),
        evidenceTasks: t("runtime.workbench.evidenceTasks"),
        execution: t("runtime.workbench.execution"),
        generic: t("runtime.workbench.generic"),
        genericCaption: (values) => t("runtime.workbench.genericCaption", values),
        genericNotice: t("runtime.workbench.genericNotice"),
        groundedAnswer: t("runtime.workbench.groundedAnswer"),
        highUrgent: t("runtime.workbench.highUrgent"),
        inbox: t("runtime.workbench.inbox"),
        kind: t("runtime.workbench.kind"),
        knowledgeCaption: (values) => t("runtime.workbench.knowledgeCaption", values),
        module: t("runtime.workbench.module"),
        needsReview: t("runtime.workbench.needsReview"),
        next: t("runtime.workbench.next"),
        noAnswer: t("runtime.workbench.noAnswer"),
        noApprovals: t("runtime.workbench.noApprovals"),
        noMeeting: t("runtime.workbench.noMeeting"),
        notScheduled: t("runtime.workbench.notScheduled"),
        open: t("runtime.workbench.open"),
        ownerReview: t("runtime.workbench.ownerReview"),
        payableCaption: (values) => t("runtime.workbench.payableCaption", values),
        policy: t("runtime.workbench.policy"),
        proposals: t("runtime.workbench.proposals"),
        qualified: t("runtime.workbench.qualified"),
        reader: t("runtime.workbench.reader"),
        readerNotice: t("runtime.workbench.readerNotice"),
        registered: (values) => t("runtime.workbench.registered", values),
        reviewOnly: t("runtime.workbench.reviewOnly"),
        sales: t("runtime.workbench.sales"),
        scheduleCaption: (values) => t("runtime.workbench.scheduleCaption", values),
        slaCaption: (values) => t("runtime.workbench.slaCaption", values),
        support: t("runtime.workbench.support"),
        supportNotice: t("runtime.workbench.supportNotice"),
        title: t("runtime.workbench.title"),
        unavailable: t("runtime.workbench.unavailable"),
        unavailableNotice: t("runtime.workbench.unavailableNotice"),
        waitChannel: t("runtime.workbench.waitChannel"),
        waiting: t("runtime.workbench.waiting"),
    },
})

type KindWorkbenchBlockFixtureProps = Omit<ComponentProps<typeof ActualKindWorkbenchBlock>, "copy"> & {
    readonly locale?: "en" | "vi"
}
const KindWorkbenchBlockCopyFixture = (props: KindWorkbenchBlockFixtureProps) => {
    const t = useTranslations("console.agentos.modules")
    return <ActualKindWorkbenchBlock {...props} copy={copyFor(t)} />
}
const KindWorkbenchBlock = ({ locale = "en", ...props }: KindWorkbenchBlockFixtureProps) => (
    <NextIntlClientProvider
        locale={locale}
        messages={locale === "en" ? enMessages : viMessages}
        timeZone={TIME_ZONE}
        onError={(error) => {
            throw error
        }}
    >
        <KindWorkbenchBlockCopyFixture {...props} />
    </NextIntlClientProvider>
)

describe("KindWorkbenchBlock", () => {
    it.each([
        ["support-queue", "Support queue"],
        ["accounting-sheet", "Accounting workbench"],
        ["sales-pipeline", "Sales workbench"],
        ["calendar-week", "Calendar week"],
        ["document-reader", "Document reader"],
    ])("resolves trusted workbench %s", (workbenchKey, expectedTitle) => {
        const html = render(
            <KindWorkbenchBlock
                moduleId="installation-1"
                kindKey="open-kind"
                workbenchKey={workbenchKey}
                workbenchVersion="1.0.0"
                registry={DEFAULT_WORKBENCH_REGISTRY}
            />,
        ).container.innerHTML
        expect(html).toContain(expectedTitle)
        expect(html).not.toContain("No registered workbench")
    })

    it("mounts the Sales workbench on the sales-pipeline entry instead of asserting static counts", () => {
        const html = render(
            <KindWorkbenchBlock
                moduleId="installation-1"
                kindKey="sales-copilot"
                workbenchKey="sales-pipeline"
                workbenchVersion="1.0.0"
                registry={DEFAULT_WORKBENCH_REGISTRY}
            />,
        ).container.innerHTML
        expect(html).toContain("Sales workbench")
        expect(html).toContain("sales-pipeline@1.0.0")
        expect(html).not.toMatch(/>12</u)
        expect(html).not.toMatch(/>4</u)
    })

    it("projects durable tasks into the kind workbench instead of static queue claims", () => {
        const html = render(
            <KindWorkbenchBlock
                moduleId="installation-1"
                kindKey="customer-support"
                workbenchKey="support-queue"
                workbenchVersion="1.0.0"
                tasks={[
                    {
                        id: "task-1",
                        installationId: "installation-1",
                        sourceEventId: "event-1",
                        contextVersionId: "context-1",
                        title: "Customer follow-up overdue",
                        summary: "Waiting",
                        priority: "urgent",
                        status: "open",
                        expectedVersion: 1,
                        workbenchKey: "support-queue",
                        workbenchVersion: "1.0.0",
                        workbenchRef: "ticket-1",
                        evidence: {},
                        dueAt: null,
                        createdAt: "2026-08-26T00:00:00.000Z",
                        updatedAt: "2026-08-26T00:00:00.000Z",
                    },
                ]}
                events={[]}
                registry={DEFAULT_WORKBENCH_REGISTRY}
            />,
        ).container.innerHTML
        expect(html).toContain("Customer follow-up overdue")
        expect(html).toContain("High / urgent")
        expect(html).not.toContain("#4821")
    })

    describe.each(["en", "vi"] as const)("Workbench copy %s", (locale) => {
        it.each([
            "support-queue",
            "accounting-sheet",
            "calendar-week",
            "document-reader",
            "sales-pipeline",
            "conversation-inbox",
            "generic-workbench",
            "missing",
        ])("keeps %s registration identity while translating its title", (workbenchKey) => {
            const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.workbench
            const html = render(
                <KindWorkbenchBlock
                    locale={locale}
                    moduleId="raw-module"
                    kindKey="raw-kind"
                    workbenchKey={workbenchKey}
                    workbenchVersion="1.0.0"
                    registry={DEFAULT_WORKBENCH_REGISTRY}
                />,
            ).container.innerHTML
            expect(html).toContain(copy.title)
            expect(html).toContain(workbenchKey + "@1.0.0")
            if (workbenchKey === "missing") expect(html).toContain(copy.unavailableNotice)
        })
    })

    describe.each(["en", "vi"] as const)("Workbench persisted branches %s", (locale) => {
        const task: AgentosRuntimeTask = {
            id: "task/raw",
            installationId: "installation/raw",
            sourceEventId: "event/raw",
            contextVersionId: "context/raw",
            title: "Owner task",
            summary: "Raw summary",
            priority: "high",
            status: "in_progress",
            expectedVersion: 7,
            workbenchKey: "calendar-week",
            workbenchVersion: "1.0.0",
            workbenchRef: "reference/raw",
            evidence: {},
            dueAt: "2026-08-26T12:30:00.000Z",
            createdAt: "2026-08-26T00:00:00.000Z",
            updatedAt: "2026-08-26T00:00:00.000Z",
        }
        const event: AgentosRuntimeOperationEvent = {
            id: "event/raw",
            installationId: "installation/raw",
            contextVersionId: "context/raw",
            source: "raw-source",
            externalEventId: "external/raw",
            eventType: "raw-event",
            observedAt: "2026-08-26T00:00:00.000Z",
            kindKey: "raw-kind",
            kindVersion: "1.0.0",
            replyContractKey: "reply/raw",
            replyContractVersion: "1.0.0",
            toolSchemaDigest: "raw-digest",
            payload: {},
            evidence: {},
            createdAt: "2026-08-26T00:00:00.000Z",
        }
        it.each(["support-queue", "accounting-sheet", "calendar-week", "document-reader"])(
            "renders active tasks and excludes completed work in %s",
            (workbenchKey) => {
                const copy = (locale === "en" ? enMessages : viMessages).console.agentos.modules.runtime.workbench
                const props = {
                    locale,
                    moduleId: "installation/raw",
                    kindKey: "raw-kind",
                    workbenchKey,
                    workbenchVersion: "1.0.0",
                    registry: DEFAULT_WORKBENCH_REGISTRY,
                }
                const html = render(
                    <KindWorkbenchBlock
                        {...props}
                        tasks={[
                            { ...task, id: "completed", title: "Completed excluded", status: "completed" },
                            task,
                            { ...task, id: "normal", status: "open", priority: "normal" },
                        ]}
                        events={[event]}
                    />,
                ).container.innerHTML
                if (workbenchKey === "accounting-sheet") {
                    expect(html).toContain("Accounting workbench")
                } else {
                    expect(html).toContain("Owner task")
                    expect(html).not.toContain("Completed excluded")
                    expect(html).toMatch(/>2</u)
                }
                if (workbenchKey === "support-queue") expect(html).toContain("raw-source")
                if (workbenchKey === "calendar-week") expect(html).toContain(new Date(task.dueAt!).toLocaleString())
                const empty = render(<KindWorkbenchBlock {...props} tasks={[]} events={[]} />).container.innerHTML
                const emptyLabel =
                    workbenchKey === "support-queue"
                        ? copy.clear
                        : workbenchKey === "calendar-week"
                          ? copy.noMeeting
                          : copy.noAnswer
                expect(empty).toContain(workbenchKey === "accounting-sheet" ? "Accounting workbench" : emptyLabel)
                if (workbenchKey === "calendar-week") {
                    const unscheduled = render(<KindWorkbenchBlock {...props} tasks={[{ ...task, dueAt: null }]} />)
                        .container.innerHTML
                    expect(unscheduled).toContain(copy.notScheduled)
                }
            },
        )
    })
})
