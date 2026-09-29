import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useGroupChatOffice, type GroupChatOfficeScope } from "./useGroupChatOffice"

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

const mocks = vi.hoisted(() => ({
    office: vi.fn(),
    group: vi.fn(),
    notices: vi.fn(),
    notice: vi.fn(),
    live: vi.fn(),
    invite: vi.fn(),
}))
const selectTab = vi.hoisted(() => vi.fn())

vi.mock("@/hooks", () => ({
    useCollabLive: mocks.live,
    useMutateCollabInviteByEmailSwr: mocks.invite,
    useQueryCollabGroupSwr: mocks.group,
    useQueryCollabNoticeSwr: mocks.notice,
    useQueryCollabNoticesSwr: mocks.notices,
    useQueryCollabOfficeSwr: mocks.office,
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

const OFFICE = {
    group: { name: "Văn phòng An" },
    viewer: { memberId: "mem-an", role: "owner" },
    participants: [
        {
            memberId: "mem-an",
            kind: "human",
            displayName: "An Nguyen",
            role: "owner",
            status: "active",
            moduleInstallationId: null,
        },
    ],
}

const scope = (overrides: Partial<GroupChatOfficeScope> = {}): GroupChatOfficeScope => ({
    workspaceId: "ws-1",
    acceptanceMode: false,
    tab: "office",
    selectTab,
    ...overrides,
})

let state: {
    office: Query
    group: Query
    notices: Query
    notice: Query
    invite: Mutation
    live: { readonly status: string; readonly reason: string | null; readonly lastHint: null }
}

beforeEach(() => {
    state = {
        office: query(ok(OFFICE)),
        group: query(ok({ messages: [], cards: [] })),
        notices: query(
            ok({
                notices: [
                    { notice: { noticeId: "n-open" }, turn: { state: "open" }, target: {} },
                    { notice: { noticeId: "n-done" }, turn: { state: "resolved" }, target: {} },
                ],
            }),
        ),
        notice: query(),
        invite: mutation(ok({ outcome: "created" })),
        live: { status: "subscribed", reason: null, lastHint: null },
    }
    mocks.office.mockImplementation(() => state.office)
    mocks.group.mockImplementation(() => state.group)
    mocks.notices.mockImplementation(() => state.notices)
    mocks.notice.mockImplementation(() => state.notice)
    mocks.invite.mockImplementation(() => state.invite)
    mocks.live.mockImplementation(() => state.live)
})

afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
})

describe("useGroupChatOffice", () => {
    describe("reads", () => {
        it("mounts the Office read on the workspace and the dependent reads once it answers", () => {
            const { result } = renderHook(() => useGroupChatOffice(scope()))
            expect(mocks.office).toHaveBeenLastCalledWith("ws-1")
            expect(mocks.live).toHaveBeenLastCalledWith("ws-1")
            // The socket is up, so neither read polls.
            expect(mocks.group).toHaveBeenLastCalledWith("ws-1", undefined, 0)
            expect(mocks.notices).toHaveBeenLastCalledWith("ws-1", undefined, 0)
            expect(result.current.officeReady).toBe(true)
            expect(result.current.officeView?.viewer).toEqual({ memberId: "mem-an", role: "owner" })
            expect(result.current.outstandingNotices.map((item) => item.notice.noticeId)).toEqual(["n-open"])
        })

        it("withholds every Office read while an invitation is open", () => {
            renderHook(() => useGroupChatOffice(scope({ acceptanceMode: true })))
            expect(mocks.office).toHaveBeenLastCalledWith(null)
            expect(mocks.live).toHaveBeenLastCalledWith(null)
            expect(mocks.group).toHaveBeenLastCalledWith(null, undefined, 0)
        })

        it("holds the dependent reads until Office answers", () => {
            state.office = query()
            const { result, rerender } = renderHook(() => useGroupChatOffice(scope()))
            expect(result.current.officeReady).toBe(false)
            expect(mocks.group).toHaveBeenLastCalledWith(null, undefined, 0)
            expect(mocks.notices).toHaveBeenLastCalledWith(null, undefined, 0)
            state.office = query(ok(OFFICE))
            rerender()
            expect(result.current.officeReady).toBe(true)
            expect(mocks.group).toHaveBeenLastCalledWith("ws-1", undefined, 0)
        })

        it("polls the conversation and the notices only while the live channel is lost", () => {
            state.live = { status: "disconnected", reason: "transport close", lastHint: null }
            renderHook(() => useGroupChatOffice(scope()))
            expect(mocks.group).toHaveBeenLastCalledWith("ws-1", undefined, 5_000)
            expect(mocks.notices).toHaveBeenLastCalledWith("ws-1", undefined, 15_000)
        })

        it("stops polling again once the live channel is subscribed", () => {
            state.live = { status: "disconnected", reason: "transport close", lastHint: null }
            const { rerender } = renderHook(() => useGroupChatOffice(scope()))
            state.live = { status: "subscribed", reason: null, lastHint: null }
            rerender()
            expect(mocks.group).toHaveBeenLastCalledWith("ws-1", undefined, 0)
            expect(mocks.notices).toHaveBeenLastCalledWith("ws-1", undefined, 0)
        })
    })

    describe("invite", () => {
        it("ignores an empty email", async () => {
            const { result } = renderHook(() => useGroupChatOffice(scope()))
            await act(async () => {
                await result.current.submitInvite()
            })
            expect(state.invite.trigger).not.toHaveBeenCalled()
        })

        it("confirms a created invitation and clears the field", async () => {
            const { result } = renderHook(() => useGroupChatOffice(scope()))
            act(() => {
                result.current.changeInviteEmail("minh@nivo.vn")
                result.current.changeInviteRole("manager")
            })
            await act(async () => {
                await result.current.submitInvite()
            })
            expect(state.invite.trigger).toHaveBeenCalledWith({ email: "minh@nivo.vn", role: "manager" })
            expect(result.current.invite).toMatchObject({
                email: "",
                invitedEmail: "minh@nivo.vn",
                role: "manager",
                outcome: "created",
            })
        })

        it("keeps the email for an existing invitation", async () => {
            state.invite = mutation(ok({ outcome: "existing" }))
            const { result } = renderHook(() => useGroupChatOffice(scope()))
            act(() => result.current.changeInviteEmail("huy@nivo.vn"))
            await act(async () => {
                await result.current.submitInvite()
            })
            expect(result.current.invite.outcome).toBe("existing")
            expect(result.current.invite.email).toBe("huy@nivo.vn")
        })

        it.each([
            ["a refusal", fail("forbidden")],
            ["an unknown outcome", ok({ outcome: "queued" })],
            ["an empty answer", ok(undefined)],
        ])("reports %s as refused", async (_label, answer) => {
            state.invite = mutation(answer)
            const { result } = renderHook(() => useGroupChatOffice(scope()))
            act(() => result.current.changeInviteEmail("x@nivo.vn"))
            await act(async () => {
                await result.current.submitInvite()
            })
            expect(result.current.invite.outcome).toBe("refused")
            expect(result.current.invite.invitedEmail).toBeNull()
        })
    })

    describe("notices", () => {
        const openNotice = (answer: Answer, noticeScope = scope()) => {
            const { result, rerender } = renderHook(() => useGroupChatOffice(noticeScope))
            act(() => result.current.openNotice("n-1"))
            expect(mocks.notice).toHaveBeenLastCalledWith("ws-1", "n-1")
            state.notice = query(answer)
            rerender()
            return result
        }

        it.each([
            ["an unreadable notice", "unavailable", fail("forbidden")],
            ["a handled turn", "handled", ok({ outcome: "handled" })],
            ["an ended turn", "ended", ok({ outcome: "ended" })],
            ["an unknown outcome", "unavailable", ok({ outcome: "unavailable" })],
        ])("records %s as %s", async (_label, expected, answer) => {
            const result = openNotice(answer)
            await waitFor(() => expect(result.current.noticeOutcomes).toEqual({ "n-1": expected }))
            expect(mocks.notice).toHaveBeenLastCalledWith("ws-1", null)
        })

        it.each([
            ["approval", { approvalId: "ap-1", taskId: null, cardMessageId: null }, "collab-approval-ap-1"],
            ["task", { approvalId: null, taskId: "t-1", cardMessageId: null }, "collab-task-t-1"],
            ["card", { approvalId: null, taskId: null, cardMessageId: "m-1" }, "collab-msg-m-1"],
        ])("scrolls an open %s notice to its target", async (_label, target, elementId) => {
            const node = document.createElement("div")
            node.id = elementId
            node.scrollIntoView = vi.fn()
            document.body.appendChild(node)
            const result = openNotice(ok({ outcome: "open", target }))
            await waitFor(() => expect(node.scrollIntoView).toHaveBeenCalledWith({ block: "center" }))
            expect(result.current.noticeOutcomes).toEqual({})
            node.remove()
        })

        it("returns to Office for an open notice raised from Tasks", async () => {
            openNotice(ok({ outcome: "open", target: { approvalId: "ap-1", taskId: null, cardMessageId: null } }), scope({ tab: "tasks" }))
            await waitFor(() => expect(selectTab).toHaveBeenCalledWith("office"))
        })

        it("closes an open notice without a target and without scrolling", async () => {
            const result = openNotice(ok({ outcome: "open", target: { approvalId: null, taskId: null, cardMessageId: null } }))
            await waitFor(() => expect(mocks.notice).toHaveBeenLastCalledWith("ws-1", null))
            expect(selectTab).not.toHaveBeenCalled()
            expect(result.current.noticeOutcomes).toEqual({})
        })
    })
})
