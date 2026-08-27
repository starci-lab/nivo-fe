import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("next-intl", () => ({ useLocale: () => "en" }))
import { AcademyChrome } from "./index"

const AcademyContent = () => <main>Academy content</main>

describe("academy chrome", () => {
    it("emits the document ground theme and preserves routed content", () => {
        const html = renderToStaticMarkup(<AcademyChrome content={AcademyContent} contentProps={{}} />)
        expect(html).toContain("background-color: var(--background)")
        expect(html).toContain("Academy content")
    })
})
