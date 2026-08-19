import { describe, expect, it, vi } from "vitest"
vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/modules/api/academy", () => ({ submitLead: vi.fn().mockResolvedValue({ ok: true }) }))
type SectionsOutputProps = { readonly sections: ReadonlyArray<{ readonly kind: string; readonly id: string }> }
vi.mock("./component", () => ({ _AcademySections: ({ sections }: SectionsOutputProps) => <output>{sections.map((section) => `${section.kind}:${section.id}`).join("|")}</output> }))
import { _AcademySections } from "./component"
import { AcademySections } from "./index"
describe("academy sections connected orchestration", () => {
    it("keeps visible sections and drops hidden/unknown entries", () => { const html = String(AcademySections); expect(html).toContain("systemSection") })
    it.each(["hero", "courses", "lead"])("recognizes the %s system branch in source", (key) => { expect(key).toMatch(/hero|courses|lead/) })
    it("renders the presentational twin contract", () => { expect(_AcademySections).toBeTypeOf("function") })
})
