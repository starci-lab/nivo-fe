import type * as NivoApi from "@nivo/api"
import { describe, expect, it, vi } from "vitest"

const client = vi.hoisted(() => ({ graphql: vi.fn() }))
vi.mock("@nivo/api", async (importOriginal) => ({
    ...(await importOriginal<typeof NivoApi>()),
    createGraphqlClient: () => client,
}))

import { fetchCourses, submitLead } from "./academy"

const course = (id: string, sortIndex: number) => ({
    id,
    slug: id,
    title: id,
    summary: null,
    priceText: null,
    sortIndex,
})

describe("academy API operations", () => {
    it("sorts successful courses, parses the wire rows and passes cache revalidation", async () => {
        client.graphql.mockImplementation(async (_query: string, parse: (input: unknown) => unknown) => ({
            ok: true,
            data: parse([course("2", 2), course("1", 1)]),
        }))
        await expect(fetchCourses()).resolves.toMatchObject({ ok: true, data: [{ id: "1" }, { id: "2" }] })
        expect(client.graphql.mock.calls[0]![3]).toEqual({ revalidate: 60 })
    })

    it("rejects a catalog row that is not the shape the contract promises", async () => {
        client.graphql.mockImplementation(async (_query: string, parse: (input: unknown) => unknown) => ({
            ok: parse([{ id: 1 }]) !== null,
        }))
        await expect(fetchCourses()).resolves.toEqual({ ok: false })
    })

    it("hands a failed catalog read back as its outcome and forwards lead results", async () => {
        const offline = { ok: false, kind: "unavailable", status: null, code: "NETWORK", reason: "offline", retryable: true }
        client.graphql.mockResolvedValueOnce(offline)
        await expect(fetchCourses()).resolves.toEqual(offline)
        client.graphql.mockResolvedValueOnce({ ok: true, data: { id: "lead-1" } })
        await expect(submitLead({ name: "Reader", contact: "reader@example.test", message: "Hello" })).resolves.toEqual({
            ok: true,
            data: { id: "lead-1" },
        })
    })
})
