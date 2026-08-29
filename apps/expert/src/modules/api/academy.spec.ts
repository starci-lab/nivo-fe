import { describe, expect, it, vi } from "vitest"

vi.mock("./graphql", () => ({ graphql: vi.fn() }))

import { graphql } from "./graphql"
import { fetchCourses, submitLead } from "./academy"

describe("academy API operations", () => {
    it("sorts successful courses and passes cache revalidation", async () => {
        vi.mocked(graphql).mockResolvedValue({ ok: true, data: [
            { id: "2", slug: "second", title: "Second", summary: null, priceText: null, sortIndex: 2 },
            { id: "1", slug: "first", title: "First", summary: "Intro", priceText: "10", sortIndex: 1 },
        ] })
        await expect(fetchCourses()).resolves.toMatchObject({ courses: [{ id: "1" }, { id: "2" }] })
        expect(vi.mocked(graphql).mock.calls[0][2]).toEqual({ next: { revalidate: 60 } })
    })

    it("turns failed catalog reads into an empty catalog and forwards lead results", async () => {
        vi.mocked(graphql).mockResolvedValueOnce({ ok: false, reason: "offline" })
        await expect(fetchCourses()).resolves.toEqual({ courses: [], reason: "offline" })
        vi.mocked(graphql).mockResolvedValueOnce({ ok: true, data: { id: "lead-1" } })
        await expect(submitLead({ name: "Reader", contact: "reader@example.test", message: "Hello" }))
            .resolves.toEqual({ ok: true })
        vi.mocked(graphql).mockResolvedValueOnce({ ok: false, reason: "invalid contact" })
        await expect(submitLead({ name: "Reader", contact: "bad" })).resolves.toEqual({ ok: false, reason: "invalid contact" })
    })
})