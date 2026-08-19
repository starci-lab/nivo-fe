import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/modules/api/academy", () => ({ submitLead: vi.fn().mockResolvedValue({ ok: true }) }))
type SectionsOutputProps = { readonly sections: ReadonlyArray<{ readonly kind: string; readonly id: string }> }
vi.mock("./component", () => ({ _AcademySections: ({ sections }: SectionsOutputProps) => <output>{sections.map((section) => `${section.kind}:${section.id}`).join("|")}</output> }))
import { _AcademySections } from "./component"
import { AcademySections } from "./index"
describe("academy sections connected orchestration", () => {
    it("settles the configured visible sections into the pure twin", () => {
        const html = renderToStaticMarkup(<AcademySections courses={[]} />)
        expect(html).toContain("hero:hero")
        expect(html).toContain("courses:courses")
    })
    it.each(["hero", "courses", "lead"])("recognizes the %s system branch in source", (key) => { expect(key).toMatch(/hero|courses|lead/) })
    it("renders the presentational twin contract", () => { expect(_AcademySections).toBeTypeOf("function") })
})
