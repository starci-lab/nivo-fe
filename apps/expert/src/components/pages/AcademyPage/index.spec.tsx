import { describe, expect, it, vi } from "vitest"
vi.mock("@/modules/api/academy", () => ({ fetchCourses: vi.fn() }))
type PageProps = { readonly courses: ReadonlyArray<{ readonly title: string }> }
vi.mock("./component", () => ({ AcademyPageBase: ({ courses }: PageProps) => <output>{courses.map((course) => course.title).join(",")}</output> }))
import { fetchCourses } from "@/modules/api/academy"
import { AcademyPage } from "./index"
describe("academy page server orchestration", () => {
    it("passes a successful catalog", async () => { vi.mocked(fetchCourses).mockResolvedValue({ courses: [{ id: "1", slug: "starter", title: "Starter", summary: null, priceText: null, sortIndex: 0 }] }); await expect(AcademyPage({})).resolves.toMatchObject({ props: { courses: [{ title: "Starter" }] } }) })
    it("passes an empty catalog after a failed fetch", async () => { vi.mocked(fetchCourses).mockResolvedValue({ courses: [], reason: "offline" }); await expect(AcademyPage({})).resolves.toMatchObject({ props: { courses: [] } }) })
})
