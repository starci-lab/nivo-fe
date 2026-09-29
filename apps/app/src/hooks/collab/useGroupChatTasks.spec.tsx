import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { collabQuestionFixture, collabTaskFixture } from "@/test-support/mock-result"
import { useGroupChatTasks, type GroupChatTasksScope } from "./useGroupChatTasks"

type Answer =
    | { readonly ok: true; readonly data: unknown }
    | {
          readonly ok: false
          readonly code: string
          readonly reason: string
          readonly kind: string | null
          readonly retryable: boolean
      }

type Query = { data: Answer | undefined; error: unknown; mutate: ReturnType<typeof vi.fn> }
type Mutation = { trigger: ReturnType<typeof vi.fn>; isMutating: boolean }

const mocks = vi.hoisted(() => ({ tasks: vi.fn(), press: vi.fn() }))
const selectTab = vi.hoisted(() => vi.fn())

vi.mock("@/hooks", () => ({
    useMutateCollabPressApprovalSwr: mocks.press,
    useQueryCollabTasksSwr: mocks.tasks,
}))

const ok = (data: unknown): Answer => ({ ok: true, data })
const fail = (kind: string | null, retryable = false): Answer => ({
    ok: false,
    code: "E",
    reason: "r",
    kind,
    retryable,
})
const query = (data?: Answer, error?: unknown): Query => ({ data, error, mutate: vi.fn() })
const mutation = (answer: Answer = ok({})): Mutation => ({
    trigger: vi.fn().mockResolvedValue(answer),
    isMutating: false,
})

const scope = (overrides: Partial<GroupChatTasksScope> = {}): GroupChatTasksScope => ({
    workspaceId: "ws-1",
    readScope: "ws-1",
    tab: "tasks",
    selectTab,
    ...overrides,
})

let tasks: Query = query()
let press: Mutation = mutation()

beforeEach(() => {
    tasks = query(ok({ tasks: [] }))
    press = mutation()
    mocks.tasks.mockImplementation(() => tasks)
    mocks.press.mockImplementation(() => press)
})

afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
})

describe("useGroupChatTasks", () => {
    it("reads with the current filter while the Tasks tab is selected", () => {
        const { result } = renderHook(() => useGroupChatTasks(scope()))
        expect(mocks.tasks).toHaveBeenLastCalledWith("ws-1", {})
        act(() => result.current.changeTasksFilter({ status: "working" }))
        expect(mocks.tasks).toHaveBeenLastCalledWith("ws-1", { status: "working" })
        expect(result.current.tasksView.filter).toEqual({ status: "working" })
    })

    it("holds the read scope and drops the filter outside the Tasks tab", () => {
        const { rerender } = renderHook((props: GroupChatTasksScope) => useGroupChatTasks(props), {
            initialProps: scope({ readScope: null }),
        })
        expect(mocks.tasks).toHaveBeenLastCalledWith(null, undefined)
        rerender(scope({ tab: "office" }))
        expect(mocks.tasks).toHaveBeenLastCalledWith("ws-1", undefined)
    })

    it.each([
        ["loading", "loading", query()],
        ["denied", "denied", query(fail("forbidden"))],
        ["refused", "failed", query(fail("invalid"))],
        ["errored", "failed", query(undefined, new Error("offline"))],
        ["answered", "ready", query(ok({ tasks: [] }))],
    ])("presents a %s Tasks read as %s", (_label, expected, tasksQuery) => {
        tasks = tasksQuery
        const { result } = renderHook(() => useGroupChatTasks(scope()))
        expect(result.current.tasksView.state).toBe(expected)
    })

    it("opens a task card in Office and scrolls it into view", () => {
        vi.useFakeTimers()
        const card = document.createElement("div")
        card.id = "collab-task-t-1"
        card.scrollIntoView = vi.fn()
        document.body.appendChild(card)
        const { result } = renderHook(() => useGroupChatTasks(scope()))
        result.current.openTaskCard("t-1")
        expect(selectTab).toHaveBeenCalledWith("office")
        vi.advanceTimersByTime(60)
        expect(card.scrollIntoView).toHaveBeenCalledWith({ block: "center" })
        card.remove()
    })

    it("scrolls in place when the card opens from Office", () => {
        vi.useFakeTimers()
        const { result } = renderHook(() => useGroupChatTasks(scope({ tab: "office" })))
        result.current.openTaskCard("t-missing")
        vi.advanceTimersByTime(60)
        expect(selectTab).not.toHaveBeenCalled()
    })

    it("marks the open question and clears it", () => {
        const { result } = renderHook(() => useGroupChatTasks(scope()))
        act(() =>
            result.current.answerQuestion(
                collabTaskFixture({ owningModuleDisplayName: null, owningModuleKey: "sales" }),
                collabQuestionFixture({ questionId: "q-1", body: "Tháng nào?".padEnd(120, ".") }),
            ),
        )
        expect(result.current.answering).toEqual({
            questionId: "q-1",
            moduleName: "sales",
            excerpt: "Tháng nào?".padEnd(80, "."),
        })
        act(() => result.current.cancelAnswer())
        expect(result.current.answering).toBeNull()
    })

    it("prefers the module display name for the question banner", () => {
        const { result } = renderHook(() => useGroupChatTasks(scope()))
        act(() =>
            result.current.answerQuestion(
                collabTaskFixture({ owningModuleDisplayName: "Kế toán", owningModuleKey: "accounting" }),
                collabQuestionFixture({ questionId: "q-2", body: "Mã số thuế?" }),
            ),
        )
        expect(result.current.answering?.moduleName).toBe("Kế toán")
    })

    describe("approvals", () => {
        it("settles the card the press answered with", async () => {
            const card = { approvalId: "ap-1", state: "approved" }
            let release: (value: Answer) => void = () => undefined
            press.trigger.mockReturnValueOnce(
                new Promise<Answer>((resolve) => {
                    release = resolve
                }),
            )
            const { result } = renderHook(() => useGroupChatTasks(scope()))
            void result.current.pressApproval("ap-1", "approve")
            await waitFor(() => expect(result.current.pressingApprovalId).toBe("ap-1"))
            await act(async () => release(ok({ card })))
            await waitFor(() => expect(result.current.pressingApprovalId).toBeNull())
            expect(press.trigger).toHaveBeenCalledWith({ approvalId: "ap-1", button: "approve" })
            expect(result.current.settledApprovals).toEqual({ "ap-1": card })
        })

        it("leaves the card to the revalidated read when the answer carries none", async () => {
            const { result } = renderHook(() => useGroupChatTasks(scope()))
            await act(async () => {
                await result.current.pressApproval("ap-1", "reject")
            })
            expect(result.current.settledApprovals).toEqual({})
            expect(result.current.approvalNotices).toEqual({})
        })

        it("says denied for a refused press and uncertain for a lost one, clearing on the next press", async () => {
            press = mutation(fail("forbidden"))
            const { result, rerender } = renderHook(() => useGroupChatTasks(scope()))
            await act(async () => {
                await result.current.pressApproval("ap-1", "approve")
            })
            await waitFor(() => expect(result.current.approvalNotices).toEqual({ "ap-1": "denied" }))
            press = mutation(fail(null, true))
            rerender()
            await act(async () => {
                await result.current.pressApproval("ap-1", "approve")
            })
            await waitFor(() => expect(result.current.approvalNotices).toEqual({ "ap-1": "uncertain" }))
            expect(result.current.settledApprovals).toEqual({})
        })
    })
})
