import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useGroupChatComposer, type GroupChatComposerScope } from "./useGroupChatComposer"
import type { GroupChatAnswering } from "./useGroupChatTasks"

type Answer =
    | { readonly ok: true; readonly data: unknown }
    | {
          readonly ok: false
          readonly code: string
          readonly reason: string
          readonly kind: string | null
          readonly retryable: boolean
      }

type Mutation = { trigger: ReturnType<typeof vi.fn>; isMutating: boolean }

const mocks = vi.hoisted(() => ({
    post: vi.fn(),
    reconcile: vi.fn(),
    accessToken: "token-1" as string | null,
}))

vi.mock("@/hooks", () => ({
    useAccessToken: () => mocks.accessToken,
    useCollabOfficeTransport: () => ({ reconcileRequest: mocks.reconcile }),
    useMutateCollabPostMessageSwr: mocks.post,
}))

const ok = (data: unknown): Answer => ({ ok: true, data })
const fail = (kind: string | null, retryable = false): Answer => ({
    ok: false,
    code: "E",
    reason: "r",
    kind,
    retryable,
})
const mutation = (answer: Answer = ok({})): Mutation => ({
    trigger: vi.fn().mockResolvedValue(answer),
    isMutating: false,
})

const answering: GroupChatAnswering = { questionId: "q-1", moduleName: "Sales", excerpt: "Tháng nào?" }
const clearAnswering = vi.hoisted(() => vi.fn())

const scope = (overrides: Partial<GroupChatComposerScope> = {}): GroupChatComposerScope => ({
    workspaceId: "ws-1",
    answering: null,
    clearAnswering,
    ...overrides,
})

let post: Mutation = mutation()

beforeEach(() => {
    post = mutation()
    mocks.post.mockImplementation(() => post)
    mocks.reconcile.mockResolvedValue(ok({ outcome: "unmatched" }))
    mocks.accessToken = "token-1"
})

afterEach(() => {
    vi.clearAllMocks()
})

describe("useGroupChatComposer", () => {
    it("ignores a blank message", async () => {
        const { result } = renderHook(() => useGroupChatComposer(scope()))
        act(() => result.current.changeComposer("   "))
        await act(async () => {
            await result.current.sendMessage()
        })
        expect(post.trigger).not.toHaveBeenCalled()
    })

    it("addresses the named module, answers the open question and clears on success", async () => {
        const { result } = renderHook(() => useGroupChatComposer(scope({ answering })))
        act(() => result.current.changeComposer("@Sales tháng 9"))
        await act(async () => {
            await result.current.sendMessage()
        })
        const sent = post.trigger.mock.calls[0]![0]
        expect(sent).toMatchObject({ body: "@Sales tháng 9", moduleName: "Sales", answersQuestionId: "q-1" })
        expect(typeof sent.intentId).toBe("string")
        expect(clearAnswering).toHaveBeenCalled()
        expect(result.current.composer.value).toBe("")
    })

    it("sends plain text without a module or question and keeps a fresh intent per message", async () => {
        const { result } = renderHook(() => useGroupChatComposer(scope()))
        act(() => result.current.changeComposer("Chào cả nhà"))
        await act(async () => {
            await result.current.sendMessage()
        })
        act(() => result.current.changeComposer("Tin thứ hai"))
        await act(async () => {
            await result.current.sendMessage()
        })
        const [first, second] = post.trigger.mock.calls.map((call) => call[0])
        expect(first).not.toHaveProperty("moduleName")
        expect(first).not.toHaveProperty("answersQuestionId")
        expect(first.intentId).not.toBe(second.intentId)
    })

    it("keeps the draft and marks a lost answer retryable or a refusal denied", async () => {
        post = mutation(fail("unavailable", true))
        const { result, rerender } = renderHook(() => useGroupChatComposer(scope()))
        act(() => result.current.changeComposer("Chào"))
        await act(async () => {
            await result.current.sendMessage()
        })
        expect(result.current.composer.failure).toBe("retry")
        expect(result.current.composer.value).toBe("Chào")
        post = mutation(fail("forbidden"))
        rerender()
        await act(async () => {
            await result.current.sendMessage()
        })
        expect(result.current.composer.failure).toBe("denied")
    })

    it("reconciles the same intent before resending and never resends a matched one", async () => {
        post = mutation(fail("unavailable", true))
        const { result, rerender } = renderHook(() => useGroupChatComposer(scope()))
        act(() => result.current.changeComposer("Chào"))
        await act(async () => {
            await result.current.sendMessage()
        })
        expect(result.current.composer.failure).toBe("retry")
        const intentId = post.trigger.mock.calls[0]![0].intentId
        mocks.reconcile.mockResolvedValueOnce(ok({ outcome: "matched" }))
        await act(async () => {
            await result.current.retrySend()
        })
        expect(mocks.reconcile).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "token-1", intentId })
        expect(post.trigger).toHaveBeenCalledTimes(1)
        expect(result.current.composer.failure).toBeNull()
        expect(result.current.composer.value).toBe("")

        post = mutation()
        rerender()
        act(() => result.current.changeComposer("Lần nữa"))
        await act(async () => {
            await result.current.retrySend()
        })
        expect(post.trigger).toHaveBeenCalledTimes(1)
        expect(post.trigger.mock.calls[0]![0].body).toBe("Lần nữa")
    })

    it("does not reconcile without a session token", async () => {
        mocks.accessToken = null
        const { result } = renderHook(() => useGroupChatComposer(scope()))
        await act(async () => {
            await result.current.retrySend()
        })
        expect(mocks.reconcile).not.toHaveBeenCalled()
        expect(post.trigger).not.toHaveBeenCalled()
    })

    it("does not send without a workspace", async () => {
        const { result } = renderHook(() => useGroupChatComposer(scope({ workspaceId: null })))
        act(() => result.current.changeComposer("Chào"))
        await act(async () => {
            await result.current.sendMessage()
        })
        expect(post.trigger).not.toHaveBeenCalled()
    })

    it("falls back to a time based intent when randomUUID is unavailable", async () => {
        vi.stubGlobal("crypto", {})
        const { result } = renderHook(() => useGroupChatComposer(scope()))
        act(() => result.current.changeComposer("Chào"))
        await act(async () => {
            await result.current.sendMessage()
        })
        expect(post.trigger.mock.calls[0]![0].intentId).toMatch(/^intent-\d+-/)
        vi.unstubAllGlobals()
    })
})
