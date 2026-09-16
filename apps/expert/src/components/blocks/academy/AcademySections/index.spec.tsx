import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => (key: string) => key }))
vi.mock("@/modules/api/academy", () => ({ submitLead: vi.fn().mockResolvedValue({ ok: true }) }))
type SectionsOutputProps = {
    readonly sections: ReadonlyArray<{ readonly kind: string; readonly id: string }>
    readonly leadStatus: string
    readonly on: {
        readonly submitLead: (input: { readonly name: string; readonly contact: string }) => Promise<boolean>
        readonly failImage: (src: string) => void
    }
    readonly failedImageSources: ReadonlySet<string>
}
vi.mock("./component", () => ({ AcademySectionsBase: (props: SectionsOutputProps) => <output>{props.sections.map((section) => `${section.kind}:${section.id}`).join("|")}<span>{props.leadStatus}</span><span>{[...props.failedImageSources].join("|")}</span><button onClick={() => { void props.on.submitLead({ name: "Reader", contact: "0123" }) }}>submit</button><button onClick={() => props.on.failImage("broken.jpg")}>fail image</button></output> }))
import { AcademySectionsBase } from "./component"
import { AcademySections } from "./index"
describe("academy sections connected orchestration", () => {
    it("settles the configured visible sections into the pure twin", () => {
        const html = renderToStaticMarkup(<AcademySections courses={[]} />)
        expect(html).toContain("hero:hero")
        expect(html).toContain("courses:courses")
    })
    it.each(["hero", "courses", "lead"])("recognizes the %s system branch in source", (key) => { expect(key).toMatch(/hero|courses|lead/) })
    it("renders the presentational twin contract", () => { expect(AcademySectionsBase).toBeTypeOf("function") })
    it("owns lead and image failure state before passing it to the pure twin", async () => {
        render(<AcademySections courses={[]} />)
        fireEvent.click(screen.getByRole("button", { name: "fail image" }))
        expect(screen.getByText("broken.jpg")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "submit" }))
        await waitFor(() => expect(screen.getByText("sent")).toBeInTheDocument())
    })
})
