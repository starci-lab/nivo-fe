import { apiAnswer, collabRouteFixture, runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    useNivoMutation: vi.fn((key: unknown, mutation: QueryMockCallback) => ({ key, mutation })),
    useAccessToken: vi.fn((): string | null => "tok"),
    mutate: vi.fn(async (filter: (key: unknown) => boolean) => {
        void filter
    }),
    postMessage: vi.fn(),
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation: mocks.useNivoMutation }))
vi.mock("../../auth/useAccessToken", () => ({ useAccessToken: mocks.useAccessToken }))
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate: mocks.mutate }) }))
vi.mock("@/modules/api/collab", () => ({ postCollabMessage: mocks.postMessage }))

import { postCollabMessage } from "@/modules/api/collab"
import { useMutateCollabPostMessageSwr } from "./useMutateCollabPostMessageSwr"

describe("useMutateCollabPostMessageSwr", () => {
    beforeEach(() => vi.clearAllMocks())

    it("uses the workspace key and holds without a workspace", () => {
        expect(runAndReadMock(() => useMutateCollabPostMessageSwr("ws-1"), mocks.useNivoMutation).key).toEqual([
            "collab",
            "post",
            "ws-1",
        ])
        expect(runAndReadMock(() => useMutateCollabPostMessageSwr(null), mocks.useNivoMutation).key).toBeNull()
    })

    it("posts under the caller's stable intent identity with the session token", async () => {
        mocks.postMessage.mockResolvedValue(
            apiAnswer(postCollabMessage, {
                ok: true,
                data: { route: collabRouteFixture("not-addressed") },
            }),
        )
        const hook = runAndReadMock(() => useMutateCollabPostMessageSwr("ws-1"), mocks.useNivoMutation)
        await hook.mutation({
            intentId: "intent-1",
            body: "@Sales draft",
            moduleName: "Sales",
            answersQuestionId: "q-1",
        })
        expect(postCollabMessage).toHaveBeenCalledWith({
            workspaceId: "ws-1",
            accessToken: "tok",
            intentId: "intent-1",
            body: "@Sales draft",
            moduleName: "Sales",
            answersQuestionId: "q-1",
        })
    })

    it("revalidates every cached collab projection of the workspace after an accepted post", async () => {
        mocks.postMessage.mockResolvedValue(
            apiAnswer(postCollabMessage, {
                ok: true,
                data: { route: collabRouteFixture("admitted") },
            }),
        )
        const hook = runAndReadMock(() => useMutateCollabPostMessageSwr("ws-1"), mocks.useNivoMutation)
        await hook.mutation({ intentId: "i-1", body: "go" })
        const filter = mocks.mutate.mock.calls[0]?.[0]
        expect(typeof filter).toBe("function")
        if (typeof filter !== "function") throw new Error("Expected a cache filter")
        expect(filter(["NIVO_QUERY", "viewer", "collab", "group", "ws-1", null])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "tasks", "ws-1", "m-1", null, null, null, null])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "task", "ws-1", "t-1"])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "notices", "ws-1", null])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "office", "ws-1"])).toBe(false)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "tasks", "ws-2", null, null, null, null, null])).toBe(false)
        expect(filter("opaque-string-key")).toBe(false)
    })
})
