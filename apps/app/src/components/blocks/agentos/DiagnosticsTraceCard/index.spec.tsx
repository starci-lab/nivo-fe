import { createTranslator } from "next-intl"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import enMessages from "../../../../messages/en.json"
import { DiagnosticsTraceCard } from "."
import type { AgentosModuleRuntime } from "../../../../modules/api/agentos-module-runtime"
import { buildModulePageCopy } from "../../../../modules/agentos/module-page-copy"
import { TIME_ZONE } from "@/modules/i18n"
import type { Formatter } from "../../../../modules/i18n/formatter"

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
const event: AgentosModuleRuntime["operationEvents"][number] = {
    id: "event-1",
    installationId: "installation-1",
    contextVersionId: "context-1",
    source: "Telegram",
    externalEventId: "external-1",
    eventType: "Delivery received",
    observedAt: "2026-08-26T00:00:00.000Z",
    kindKey: "customer-support",
    kindVersion: "1.0.0",
    replyContractKey: "reply-1",
    replyContractVersion: "1.0.0",
    toolSchemaDigest: "digest",
    payload: {},
    evidence: {},
    createdAt: "2026-08-26T00:00:00.000Z",
}
const format = {
    number: () => "",
    dateTime: () => "Aug 26, 2026, 7:00 AM",
    relativeTime: () => "",
} satisfies Formatter

describe("DiagnosticsTraceCard", () => {
    it("shows the persisted event and exact event count", () => {
        const html = renderToStaticMarkup(
            <DiagnosticsTraceCard
                copy={copy}
                installationId="installation-1"
                kindKey="customer-support"
                workbenchKey="support-queue"
                events={[event]}
                format={format}
            />,
        )

        expect(html).toContain(copy.diagnostics.accepted({ count: 1 }))
        expect(html).toContain("Delivery received")
        expect(html).toContain("installation-1")
        expect(html).toContain("Aug 26, 2026")
    })
})
