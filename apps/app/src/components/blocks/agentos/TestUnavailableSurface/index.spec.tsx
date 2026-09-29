import { createTranslator } from "next-intl"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import enMessages from "../../../../messages/en.json"
import { TestUnavailableSurface } from "."
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

describe("TestUnavailableSurface", () => {
    it("renders the unavailable contract and closed trust state", () => {
        const html = renderToStaticMarkup(<TestUnavailableSurface copy={copy} />)

        expect(html).toContain(copy.pageTest.contractUnavailable)
        expect(html).toContain(copy.pageTest.noContract)
        expect(html).toContain(copy.pageTest.closed)
    })
})
