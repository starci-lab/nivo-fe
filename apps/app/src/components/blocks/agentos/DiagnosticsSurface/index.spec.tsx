import { fireEvent, render, screen } from "@testing-library/react"
import { createTranslator, NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"
import enMessages from "../../../../messages/en.json"
import { DiagnosticsSurface } from "."
import type { AgentosModuleRuntime } from "../../../../modules/api/agentos-module-runtime"
import type { DiagnosticsSurfaceProps } from "../../../../modules/agentos/module-page/surface-types"
import { buildModulePageCopy } from "../../../../modules/agentos/module-page-copy"
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
const props: DiagnosticsSurfaceProps = {
    installationId: "installation-1",
    kindKey: "customer-support",
    workbenchKey: "support-queue",
    diagnostics: { telegramWebhook: "ready" },
    events: [],
    selectedSignal: "all",
    compactPane: "readiness",
    onSelectSignal: vi.fn(),
    onSelectPane: vi.fn(),
}
const event: AgentosModuleRuntime["operationEvents"][number] = {
    id: "event/raw",
    installationId: "installation-1",
    contextVersionId: "context-1",
    source: "Telegram/raw",
    externalEventId: "external/raw",
    eventType: "Raw event",
    observedAt: "2026-08-26T00:00:00.000Z",
    kindKey: "customer-support",
    kindVersion: "1.0.0",
    replyContractKey: "reply/raw",
    replyContractVersion: "1.0.0",
    toolSchemaDigest: "raw",
    payload: {},
    evidence: {},
    createdAt: "2026-08-26T00:00:00.000Z",
}

describe("DiagnosticsSurface", () => {
    it("forwards diagnostic filter and compact pane selections", () => {
        const onSelectSignal = vi.fn()
        const onSelectPane = vi.fn()
        render(
            <NextIntlClientProvider locale="en" messages={enMessages} timeZone={TIME_ZONE}>
                <DiagnosticsSurface
                    copy={copy}
                    {...props}
                    events={[event]}
                    onSelectSignal={onSelectSignal}
                    onSelectPane={onSelectPane}
                />
            </NextIntlClientProvider>,
        )

        fireEvent.click(screen.getByText(copy.diagnostics.channel))
        fireEvent.click(screen.getByRole("radio", { name: copy.diagnostics.traceTab }))

        expect(screen.getByText(copy.diagnostics.accepted({ count: 1 }))).toBeInTheDocument()
        expect(screen.getByText(copy.diagnostics.telegramEvents({ count: 1 }))).toBeInTheDocument()
        expect(screen.getByText(copy.diagnostics.boundReplies({ count: 1 }))).toBeInTheDocument()
        expect(screen.getByText("Raw event")).toBeInTheDocument()
        expect(onSelectSignal).toHaveBeenCalledExactlyOnceWith("channel")
        expect(onSelectPane).toHaveBeenCalledExactlyOnceWith("evidence")
    })
})
