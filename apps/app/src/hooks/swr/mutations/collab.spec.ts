import { beforeEach, describe, expect, it, vi } from "vitest"
import { apiAnswer, collabRouteFixture, runAndReadMock } from "@/test-support/mock-result"
import type { QueryMockCallback } from "@/test-support/mock-result"

const { useNivoMutation, useSession, mutate } = vi.hoisted(() => ({
    useNivoMutation: vi.fn((_key: unknown, mutation: QueryMockCallback) => ({ key: _key, mutation })),
    useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "tok" } })),
    mutate: vi.fn(async () => undefined),
}))
vi.mock("../useNivoMutation", () => ({ useNivoMutation }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession }))
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate }) }))
vi.mock("@/modules/api/collab", () => ({
    acceptCollabInvitation: vi.fn(),
    changeCollabMemberRole: vi.fn(),
    inviteCollabMemberByEmail: vi.fn(),
    postCollabMessage: vi.fn(),
    pressCollabApprovalButton: vi.fn(),
    withdrawCollabInvitation: vi.fn(),
}))

import * as collabMutations from "./collab"
import {
    useMutateCollabAcceptInvitationSwr,
    useMutateCollabChangeMemberRoleSwr,
    useMutateCollabInviteByEmailSwr,
    useMutateCollabPostMessageSwr,
    useMutateCollabPressApprovalSwr,
    useMutateCollabWithdrawInvitationSwr,
} from "./collab"
import {
    acceptCollabInvitation,
    inviteCollabMemberByEmail,
    postCollabMessage,
    pressCollabApprovalButton,
    withdrawCollabInvitation,
} from "@/modules/api/collab"

type HookShape<TInput> = { readonly key: unknown; readonly mutation: (input: TInput) => Promise<unknown> }

describe("Collab mutation ownership", () => {
    beforeEach(() => vi.clearAllMocks())

    it("keeps each command on its own press-local workspace-scoped identity", () => {
        const post = runAndReadMock(() => useMutateCollabPostMessageSwr("ws-1"), useNivoMutation)
        const press = runAndReadMock(() => useMutateCollabPressApprovalSwr("ws-1"), useNivoMutation)
        const invite = runAndReadMock(() => useMutateCollabInviteByEmailSwr("ws-1"), useNivoMutation)
        expect(post.key).toEqual(["collab", "post", "ws-1"])
        expect(press.key).toEqual(["collab", "press", "ws-1"])
        expect(invite.key).toEqual(["collab", "invite", "ws-1"])
        expect((runAndReadMock(() => useMutateCollabAcceptInvitationSwr("ws-1"), useNivoMutation)).key).toEqual([
            "collab",
            "invite-accept",
            "ws-1",
        ])
        expect((runAndReadMock(() => useMutateCollabWithdrawInvitationSwr("ws-1"), useNivoMutation)).key).toEqual([
            "collab",
            "invite-withdraw",
            "ws-1",
        ])
        expect((runAndReadMock(() => useMutateCollabChangeMemberRoleSwr("ws-1"), useNivoMutation)).key).toEqual([
            "collab",
            "member-role",
            "ws-1",
        ])
        expect((runAndReadMock(() => useMutateCollabPostMessageSwr(null), useNivoMutation)).key).toBeNull()
    })

    it("posts a message under the caller's stable intent identity with the session token", async () => {
        vi.mocked(postCollabMessage).mockResolvedValue(apiAnswer(postCollabMessage, {
            ok: true,
            data: { route: collabRouteFixture("not-addressed") },
        }))
        const hook = runAndReadMock(() => useMutateCollabPostMessageSwr("ws-1"), useNivoMutation)
        const answer = await hook.mutation({
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
        expect(answer).toMatchObject({ ok: true })
    })

    it("revalidates every cached collab projection of the workspace after an accepted post", async () => {
        vi.mocked(postCollabMessage).mockResolvedValue(apiAnswer(postCollabMessage, {
            ok: true,
            data: { route: collabRouteFixture("admitted") },
        }))
        const hook = runAndReadMock(() => useMutateCollabPostMessageSwr("ws-1"), useNivoMutation)
        await hook.mutation({ intentId: "i-1", body: "go" })
        expect(mutate).toHaveBeenCalledTimes(1)
        const filter = (mutate.mock.calls as ReadonlyArray<ReadonlyArray<unknown>>)[0]![0] as (key: unknown) => boolean
        expect(filter(["NIVO_QUERY", "viewer", "collab", "group", "ws-1", null])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "tasks", "ws-1", "m-1", null, null, null, null])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "task", "ws-1", "t-1"])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "notices", "ws-1", null])).toBe(true)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "office", "ws-1"])).toBe(false)
        expect(filter(["NIVO_QUERY", "viewer", "collab", "tasks", "ws-2", null, null, null, null, null])).toBe(false)
        expect(filter("opaque-string-key")).toBe(false)
    })

    it("revalidates nothing when the boundary refuses the press", async () => {
        vi.mocked(pressCollabApprovalButton).mockResolvedValue(apiAnswer(pressCollabApprovalButton, {
            ok: false,
            code: "COLLAB_DENIED",
            reason: "membership",
            kind: "forbidden",
            status: 403,
            retryable: false,
        }))
        const hook = runAndReadMock(() => useMutateCollabPressApprovalSwr("ws-1"), useNivoMutation)
        const answer = await hook.mutation({ approvalId: "a-1", button: "approve" })
        expect(pressCollabApprovalButton).toHaveBeenCalledWith({
            workspaceId: "ws-1",
            accessToken: "tok",
            approvalId: "a-1",
            button: "approve",
        })
        expect(answer).toMatchObject({ ok: false, kind: "forbidden", retryable: false })
        expect(mutate).not.toHaveBeenCalled()
    })

    it("invites by email, accepts, withdraws and re-roles through the membership operations scoped to the workspace", async () => {
        vi.mocked(inviteCollabMemberByEmail).mockResolvedValue(apiAnswer(inviteCollabMemberByEmail, { ok: true, data: { outcome: "created" } }))
        const invite = runAndReadMock(() => useMutateCollabInviteByEmailSwr("ws-1"), useNivoMutation)
        await invite.mutation({ email: "person@example.com", role: "staff" })
        expect(inviteCollabMemberByEmail).toHaveBeenCalledWith({
            workspaceId: "ws-1",
            accessToken: "tok",
            email: "person@example.com",
            role: "staff",
        })
        const inviteFilter = (mutate.mock.calls as ReadonlyArray<ReadonlyArray<unknown>>)[0]![0] as (
            key: unknown,
        ) => boolean
        expect(inviteFilter(["NIVO_QUERY", "viewer", "collab", "office", "ws-1"])).toBe(true)
        expect(inviteFilter(["NIVO_QUERY", "viewer", "collab", "group", "ws-1", null])).toBe(false)

        vi.mocked(acceptCollabInvitation).mockResolvedValue(apiAnswer(acceptCollabInvitation, { ok: true, data: { outcome: "accepted" } }))
        const accept = runAndReadMock(() => useMutateCollabAcceptInvitationSwr("ws-1"), useNivoMutation)
        await accept.mutation({ invitationId: "inv-1", displayName: "An" })
        expect(acceptCollabInvitation).toHaveBeenCalledWith({
            workspaceId: "ws-1",
            accessToken: "tok",
            invitationId: "inv-1",
            displayName: "An",
        })

        vi.mocked(withdrawCollabInvitation).mockResolvedValue(apiAnswer(withdrawCollabInvitation, { ok: true, data: { outcome: "withdrawn" } }))
        const withdraw = runAndReadMock(() => useMutateCollabWithdrawInvitationSwr("ws-1"), useNivoMutation)
        await withdraw.mutation({ invitationId: "inv-1" })
        expect(withdrawCollabInvitation).toHaveBeenCalledWith({
            workspaceId: "ws-1",
            accessToken: "tok",
            invitationId: "inv-1",
        })
    })

    it("exposes no phone invitation hook or input type", () => {
        const exported = Object.keys(collabMutations).filter((name) => name.toLowerCase().includes("phone"))
        expect(exported).toEqual([])
        expect(typeof collabMutations.useMutateCollabInviteByEmailSwr).toBe("function")
    })
})
