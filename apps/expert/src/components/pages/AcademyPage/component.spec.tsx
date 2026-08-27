import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
type ChromeProps = { readonly content: React.ComponentType<SectionsProps>, readonly contentProps: SectionsProps }
type SectionsProps = { readonly courses: ReadonlyArray<{ readonly title: string }> }
vi.mock("@/components/layouts/AcademyChrome", () => ({ AcademyChrome: ({ content: Content, contentProps }: ChromeProps) => <div data-testid="chrome"><Content {...contentProps} /></div> }))
vi.mock("@/components/blocks/academy/AcademySections", () => ({ AcademySections: ({ courses }: SectionsProps) => <div>{courses.map((course) => <span key={course.title}>{course.title}</span>)}</div> }))
import { AcademyPageBase } from "./component"
describe("academy page presentation", () => {
    it.each([[[]], [[{ title: "Starter" }]], [[{ title: "A" }, { title: "B" }]]])("passes catalog fixture unchanged", (courses) => { expect(renderToStaticMarkup(<AcademyPageBase courses={courses.map((course) => ({ id: course.title, slug: course.title.toLowerCase(), title: course.title, summary: null, priceText: null, sortIndex: 0 }))} />)).toContain("chrome") })
    it("renders a course title through the sections projection", () => { expect(renderToStaticMarkup(<AcademyPageBase courses={[{ id: "1", slug: "starter", title: "Starter", summary: null, priceText: null, sortIndex: 0 }]} />)).toContain("Starter") })
})
