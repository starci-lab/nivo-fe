import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"
import { TIME_ZONE } from "../../../../modules/i18n/config"
import type { KindWorkbenchBlockCopy, WorkbenchProps } from "../../../../modules/agentos/kind-workbench"
import { KindWorkbenchContent } from "."

/** The two values an SLA caption is phrased from. */
type SlaCaptionValues = { readonly kind: string; readonly version: string }

const copy = {
    workbench: {
        support: "Support queue",
        slaCaption: ({ kind, version }: SlaCaptionValues) => `${kind}@${version}`,
        open: "Open",
        highUrgent: "Urgent",
        next: "Next task",
        clear: "Clear",
        channel: "Channel",
        waitChannel: "Waiting",
        supportNotice: "Review before sending.",
    },
} as KindWorkbenchBlockCopy
const props: WorkbenchProps = {
    copy,
    moduleId: "installation-1",
    kindKey: "support",
    workbenchVersion: "1.0.0",
    tasks: [
        {
            id: "task-1",
            installationId: "installation-1",
            sourceEventId: "event-1",
            contextVersionId: "context-1",
            title: "Urgent follow up",
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
    ],
}

describe("KindWorkbenchContent", () => {
    it("projects active task counts and the next task from runtime data", () => {
        render(
            <NextIntlClientProvider locale="en" timeZone={TIME_ZONE}>
                <KindWorkbenchContent props={props} mode="support-queue" />
            </NextIntlClientProvider>,
        )
        expect(screen.getByRole("heading", { name: "Support queue" })).toBeInTheDocument()
        expect(screen.getByText("Urgent follow up")).toBeInTheDocument()
    })
})
