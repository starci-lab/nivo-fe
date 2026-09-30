import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
vi.mock("@/modules/api/academy", () => ({ fetchCourses: vi.fn() }))
import { fetchCourses } from "@/modules/api/academy"
import { AcademyPage } from "./index"
describe("academy page server orchestration", () => {
    it("passes a successful catalog", async () => {
        vi.mocked(fetchCourses).mockResolvedValue({
            ok: true,
            data: [{ id: "1", slug: "starter", title: "Starter", summary: null, priceText: null, sortIndex: 0 }],
        })
        await expect(AcademyPage()).resolves.toMatchObject({ props: { props: { courses: [{ title: "Starter" }] } } })
    })
    it("passes an empty catalog after a failed fetch", async () => {
        vi.mocked(fetchCourses).mockResolvedValue({
            ok: false,
            kind: "unavailable",
            status: null,
            code: "NETWORK",
            reason: "offline",
            retryable: true,
        })
        await expect(AcademyPage()).resolves.toMatchObject({ props: { props: { courses: [] } } })
    })
    it("has no axe violations", async () => {
        vi.mocked(fetchCourses).mockResolvedValue({
            courses: [{ id: "1", slug: "starter", title: "Starter", summary: null, priceText: null, sortIndex: 0 }],
        })
        const { container } = render(await AcademyPage())
        await screen.findAllByText("Starter")
        await expectNoA11yViolations(container)
    })
})
