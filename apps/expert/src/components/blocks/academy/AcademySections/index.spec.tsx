import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
vi.mock("@/modules/api/academy", () => ({ submitLead: vi.fn().mockResolvedValue({ ok: true }) }))
type SectionsOutputProps = {
    readonly props: {
        readonly sections: ReadonlyArray<{ readonly kind: string; readonly id: string }>
        readonly leadStatus: string
        readonly failedImageSources: ReadonlySet<string>
    }
    readonly on: {
        readonly submitLead: (input: { readonly name: string; readonly contact: string }) => Promise<boolean>
        readonly failImage: (src: string) => void
    }
}
vi.mock("./component", () => ({
    AcademySectionsBase: (props: SectionsOutputProps) => (
        <output>
            {props.props.sections.map((section) => `${section.kind}:${section.id}`).join("|")}
            <span>{props.props.leadStatus}</span>
            <span>{[...props.props.failedImageSources].join("|")}</span>
            <button
                onClick={() => {
                    void props.on.submitLead({ name: "Reader", contact: "0123" })
                }}
            >
                submit
            </button>
            <button onClick={() => props.on.failImage("broken.jpg")}>fail image</button>
        </output>
    ),
}))
import { AcademySectionsBase } from "./component"
import { AcademySections } from "./index"
describe("AcademySections", () => {
    it("settles the configured visible sections into the pure twin", () => {
        const html = render(<AcademySections courses={[]} />).container.innerHTML
        expect(html).toContain("hero:hero")
        expect(html).toContain("courses:courses")
    })
    it("renders the presentational twin contract", () => {
        expect(AcademySectionsBase).toBeTypeOf("function")
    })
    it("owns lead and image failure state before passing it to the pure twin", async () => {
        render(<AcademySections courses={[]} />)
        fireEvent.click(screen.getByRole("button", { name: "fail image" }))
        expect(screen.getByText("broken.jpg")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "submit" }))
        await waitFor(() => expect(screen.getByText("sent")).toBeInTheDocument())
    })
})
