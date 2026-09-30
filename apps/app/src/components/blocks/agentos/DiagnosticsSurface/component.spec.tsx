import { fireEvent, render, screen } from "@testing-library/react"
import { createFormatter, createTranslator, NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"
import enMessages from "../../../../messages/en.json"
import { DiagnosticsSurfaceBase } from "./component"
import type { AgentosModuleRuntime } from "../../../../modules/api/agentos-module-runtime"
import type { DiagnosticsSurfaceProps } from "../../../../modules/agentos/module-page/surface-types"
import { buildModulePageCopy } from "../../../../modules/agentos/module-page-copy"
import { TIME_ZONE } from "../../../../modules/i18n/config"

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
const props: Omit<DiagnosticsSurfaceProps, "onSelectSignal" | "onSelectPane"> = {
    installationId: "installation-1",
    kindKey: "customer-support",
    workbenchKey: "support-queue",
    diagnostics: { telegramWebhook: "ready" },
    events: [],
    selectedSignal: "all",
    compactPane: "readiness",
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

describe("DiagnosticsSurfaceBase", () => {
    it("draws the trace evidence and forwards filter and pane commands", () => {
        const selectSignal = vi.fn()
        const selectPane = vi.fn()
        render(
            <NextIntlClientProvider locale="en" messages={enMessages} timeZone={TIME_ZONE}>
                <DiagnosticsSurfaceBase
                    props={{ ...props, copy, events: [event], format: createFormatter({ locale: "en" }) }}
                    on={{ selectSignal, selectPane }}
                />
            </NextIntlClientProvider>,
        )

        fireEvent.click(screen.getByText(copy.diagnostics.channel))
        fireEvent.click(screen.getByRole("radio", { name: copy.diagnostics.traceTab }))

        expect(screen.getByText("Raw event")).toBeInTheDocument()
        expect(selectSignal).toHaveBeenCalledExactlyOnceWith("channel")
        expect(selectPane).toHaveBeenCalledExactlyOnceWith("evidence")
    })
})
