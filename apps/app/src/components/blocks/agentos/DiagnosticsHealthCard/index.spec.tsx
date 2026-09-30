import { createTranslator } from "next-intl"
import { render } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import enMessages from "../../../../messages/en.json"
import { DiagnosticsHealthCard } from "."
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

describe("DiagnosticsHealthCard", () => {
    it("has no axe violations for the rendered health summary", async () => {
        const { container } = render(
            <DiagnosticsHealthCard
                copy={copy}
                selectedSignal="all"
                diagnostics={{ telegramWebhook: "ready", promptCache: 17 }}
            />,
        )

        await expectNoA11yViolations(container)
    })

    it.each(["all", "channel", "ai"] as const)(
        "filters %s without translating field names or values",
        (selectedSignal) => {
            const html = renderToStaticMarkup(
                <DiagnosticsHealthCard
                    copy={copy}
                    selectedSignal={selectedSignal}
                    diagnostics={{
                        telegramWebhook: "raw-webhook",
                        promptCache: 17,
                        constructor: null,
                        rawField: [1, true],
                    }}
                />,
            )

            expect(html).toContain(copy.diagnostics[selectedSignal])
            if (selectedSignal !== "ai") expect(html).toContain("raw-webhook")
            if (selectedSignal !== "channel") expect(html).toContain(copy.labels.field({ key: "promptCache" }))
            if (selectedSignal === "channel") {
                expect(html).not.toContain(copy.labels.field({ key: "promptCache" }))
                expect(html).not.toContain(copy.labels.field({ key: "rawField" }))
                expect(html).not.toContain(copy.labels.field({ key: "constructor" }))
            }
            if (selectedSignal === "ai") {
                expect(html).not.toContain("raw-webhook")
                expect(html).not.toContain(copy.labels.field({ key: "rawField" }))
                expect(html).not.toContain(copy.labels.field({ key: "constructor" }))
            }
            if (selectedSignal === "all") {
                expect(html).toContain(copy.labels.field({ key: "constructor" }))
                expect(html).toContain("[1,true]")
            }
        },
    )
})
