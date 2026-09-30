import { createTranslator } from "next-intl"
import { render } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import enMessages from "../../../../messages/en.json"
import { TestUnavailableSurface } from "."
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

describe("TestUnavailableSurface", () => {
    it("has no axe violations for the unavailable contract", async () => {
        const { container } = render(<TestUnavailableSurface copy={copy} />)

        await expectNoA11yViolations(container)
    })

    it("renders the unavailable contract and closed trust state", () => {
        const html = renderToStaticMarkup(<TestUnavailableSurface copy={copy} />)

        expect(html).toContain(copy.pageTest.contractUnavailable)
        expect(html).toContain(copy.pageTest.noContract)
        expect(html).toContain(copy.pageTest.closed)
    })
})
