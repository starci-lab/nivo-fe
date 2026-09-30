import { createTranslator } from "next-intl"
import { describe, expect, it } from "vitest"
import enMessages from "../../../messages/en.json"
import viMessages from "../../../messages/vi.json"
import { TIME_ZONE } from "@/modules/i18n"
import { buildModulePageCopy } from "."

describe.each([
    ["en", enMessages],
    ["vi", viMessages],
] as const)("Module page copy in %s", (locale, messages) => {
    const translate = createTranslator({
        locale,
        messages,
        namespace: "console.agentos.modules",
        timeZone: TIME_ZONE,
        onError: (error) => {
            throw error
        },
    })
    const copy = buildModulePageCopy(translate)
    const catalog = messages.console.agentos.modules

    it("keeps every copy surface connected to its catalog", () => {
        expect(copy.setup.title).toBe(catalog.setup.title)
        expect(copy.pageTest.suite).toBe(catalog.runtime.pageTest.suite)
        expect(copy.operate.view).toBe(catalog.runtime.operate.view)
        expect(copy.settings.title).toBe(catalog.runtime.settings.title)
        expect(copy.diagnostics.health).toBe(catalog.runtime.diagnostics.health)
        expect(copy.chatbot.title).toBe(catalog.runtime.chatbot.title)
        expect(copy.shell.modules).toBe(catalog.shell.modules)
        expect(copy.studioPage.title).toBe(catalog.studioPage.title)
    })

    it("preserves catalog interpolation for setup and diagnostics", () => {
        expect(copy.setup.revision({ revision: 2, status: copy.setup.revisionStatus.open })).toBe(
            translate("setup.revision", { revision: 2, status: copy.setup.revisionStatus.open }),
        )
        expect(copy.diagnostics.events({ count: 3 })).toBe(translate("runtime.diagnostics.events", { count: 3 }))
    })
})
