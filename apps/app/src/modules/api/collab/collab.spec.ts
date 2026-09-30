import { afterEach, describe, expect, it, vi } from "vitest"

const gateway = vi.hoisted(() => ({ graphqlFields: vi.fn() }))
vi.mock("../graphql", () => gateway)

import { collabGatewayDocument } from "./documents"
import * as collabApi from "./index"
import {
    acceptCollabInvitation,
    collabOutcomeOfReply,
    inviteCollabMemberByEmail,
    listCollabTasks,
    openCollabNotice,
    openCollabOffice,
    postCollabMessage,
    pressCollabApprovalButton,
    readCollabAvailableCommands,
    readCollabGroup,
    readCollabNotices,
    readCollabTask,
    reconcileCollabRequest,
    type CollabGatewayReply,
    type CollabGatewayRequest,
    type CollabOfficeView,
} from "./index"

type SeenCall = { readonly accessToken: string; readonly request: CollabGatewayRequest }

/** Answer every gateway call with one bare reply and record what each call carried. */
const transportSpy = (reply: CollabGatewayReply) => {
    const calls: Array<SeenCall> = []
    const spy = gateway.graphqlFields
    spy.mockImplementation(
        async (
            _document: string,
            variables: { readonly request: CollabGatewayRequest },
            options: { readonly accessToken: string },
        ) => {
            calls.push({ accessToken: options.accessToken, request: variables.request })
            return { ok: true, data: { [collabGatewayDocument(variables.request.op).field]: reply } }
        },
    )
    return { calls, spy }
}

describe("modules/api/collab", () => {
    afterEach(() => {
        gateway.graphqlFields.mockReset()
        vi.unstubAllGlobals()
    })

    it("sends one tagged request carrying the workspace scope, the op and the domain input", async () => {
        const { calls, spy } = transportSpy({
            ok: true,
            op: "postMessage",
            result: { op: "postMessage", route: { kind: "not-addressed", message: { messageId: "m-1" } } },
        })
        const answer = await postCollabMessage({
            workspaceId: "ws-1",
            accessToken: "tok",
            intentId: "intent-1",
            body: "@Sales draft the quote",
            moduleName: "Sales",
            answersQuestionId: "q-9",
        })
        expect(answer.ok).toBe(true)
        expect(calls).toEqual([
            {
                accessToken: "tok",
                request: {
                    workspaceId: "ws-1",
                    op: "postMessage",
                    input: {
                        intentId: "intent-1",
                        body: "@Sales draft the quote",
                        moduleName: "Sales",
                        answersQuestionId: "q-9",
                    },
                },
            },
        ])
    })

    it("rejects caller supplied membership and asker grant claims before transport", async () => {
        const { spy } = transportSpy({
            ok: true,
            op: "postMessage",
            result: { op: "postMessage", route: { kind: "not-addressed", message: { messageId: "m-1" } } },
        })
        const result = await postCollabMessage(Object.assign({
            workspaceId: "ws-1",
            accessToken: "tok",
            intentId: "intent-1",
            body: "hello",
        }, {
            askerGrantScope: { quote: true },
            role: "owner",
            member: { id: "m-1" },
            phone: "+84900000000",
            membership: { active: true },
        }))
        expect(result).toMatchObject({ ok: false, kind: "invalid", code: "COLLAB_INVALID", retryable: false })
        expect(spy).not.toHaveBeenCalled()
    })

    it("omits absent optional fields rather than serializing undefined", async () => {
        const { calls, spy } = transportSpy({
            ok: true,
            op: "listTasks",
            result: { op: "listTasks", page: { tasks: [] } },
        })
        await listCollabTasks({ workspaceId: "ws-1", accessToken: "tok" })
        expect(calls[0]!.request.input).toEqual({})
        await listCollabTasks({
            workspaceId: "ws-1",
            accessToken: "tok",
            personMemberId: "m-1",
            status: "working",
            cursor: "c-1",
            limit: 10,
        })
        expect(calls[1]!.request.input).toEqual({ personMemberId: "m-1", status: "working", cursor: "c-1", limit: 10 })
    })

    it("names each closed operation exactly once per call", async () => {
        const { calls, spy } = transportSpy({
            ok: true,
            op: "openOffice",
            result: { op: "openOffice", office: { group: { groupId: "g" }, participants: [] } },
        })
        await openCollabOffice({ workspaceId: "ws-1", accessToken: "tok" })
        await readCollabGroup({ workspaceId: "ws-1", accessToken: "tok", cursor: "c" })
        await readCollabTask({ workspaceId: "ws-1", accessToken: "tok", taskId: "t-1" })
        await readCollabAvailableCommands({ workspaceId: "ws-1", accessToken: "tok", moduleName: "Sales" })
        await readCollabNotices({ workspaceId: "ws-1", accessToken: "tok" })
        await openCollabNotice({ workspaceId: "ws-1", accessToken: "tok", noticeId: "n-1" })
        await reconcileCollabRequest({ workspaceId: "ws-1", accessToken: "tok", intentId: "i-1" })
        await pressCollabApprovalButton({
            workspaceId: "ws-1",
            accessToken: "tok",
            approvalId: "a-1",
            button: "approve",
        })
        await inviteCollabMemberByEmail({
            workspaceId: "ws-1",
            accessToken: "tok",
            email: "person@example.com",
            role: "staff",
        })
        expect(calls.map((c) => c.request.op)).toEqual([
            "openOffice",
            "readGroup",
            "readTask",
            "availableCommands",
            "readNotices",
            "openNotice",
            "reconcileRequest",
            "pressApprovalButton",
            "inviteByEmail",
        ])
        expect(calls[1]!.request.input).toEqual({ cursor: "c" })
        expect(calls[7]!.request.input).toEqual({ approvalId: "a-1", button: "approve" })
        expect(calls[8]!.request.input).toEqual({ email: "person@example.com", role: "staff" })
    })

    it("projects the rev5 office bundle with the viewer identity and each roster entry's own identity", async () => {
        const office: CollabOfficeView = {
            group: { groupId: "g-1", workspaceId: "ws-1", name: "Office", isDefaultOffice: true },
            participants: [
                {
                    memberId: "mem-lan",
                    kind: "human",
                    displayName: "Lan",
                    role: "owner",
                    status: "active",
                    moduleInstallationId: null,
                },
                {
                    memberId: "mem-sales",
                    kind: "module",
                    displayName: "Sales",
                    role: "module",
                    status: "active",
                    moduleInstallationId: "inst-sales",
                },
            ],
            viewer: { memberId: "mem-lan", role: "owner" },
        }
        const { spy } = transportSpy({ ok: true, op: "openOffice", result: { op: "openOffice", office } })
        const answer = await openCollabOffice({ workspaceId: "ws-1", accessToken: "tok" })
        expect(answer).toEqual({ ok: true, data: office })
        if (!answer.ok) throw new Error("expected an ok office result")
        const human = answer.data.participants.find((participant) => participant.kind === "human")
        const hired = answer.data.participants.find((participant) => participant.kind === "module")
        expect(human?.memberId).toBe(answer.data.viewer.memberId)
        expect(human?.moduleInstallationId).toBeNull()
        expect(hired?.moduleInstallationId).toBe("inst-sales")
    })

    it("invites exactly one email into one role and never serializes a phone", async () => {
        const { calls, spy } = transportSpy({
            ok: true,
            op: "inviteByEmail",
            result: { op: "inviteByEmail", membership: { outcome: "created", member: { memberId: "mem-1" } } },
        })
        const answer = await inviteCollabMemberByEmail({
            workspaceId: "ws-1",
            accessToken: "tok",
            email: "person@example.com",
            role: "manager",
        })
        expect(calls[0]!.request.op).toBe("inviteByEmail")
        expect(calls[0]!.request.input).toEqual({ email: "person@example.com", role: "manager" })
        expect(JSON.stringify(calls[0]!.request)).not.toContain("phone")
        expect(answer).toEqual({ ok: true, data: { outcome: "created", member: { memberId: "mem-1" } } })
    })

    it("reads the membership result record for accept, withdraw and role change", async () => {
        const { calls, spy } = transportSpy({
            ok: true,
            op: "acceptInvitation",
            result: {
                op: "acceptInvitation",
                membership: { outcome: "accepted", member: { memberId: "mem-2", role: "staff" } },
            },
        })
        const accepted = await acceptCollabInvitation({
            workspaceId: "ws-1",
            accessToken: "tok",
            invitationId: "inv-1",
            displayName: "An",
        })
        expect(calls[0]!.request.op).toBe("acceptInvitation")
        expect(accepted).toEqual({
            ok: true,
            data: { outcome: "accepted", member: { memberId: "mem-2", role: "staff" } },
        })
    })

    it("sends only the invitation identity on acceptance - never an accepter email, phone, role or principal", async () => {
        const { calls, spy } = transportSpy({
            ok: true,
            op: "acceptInvitation",
            result: { op: "acceptInvitation", membership: { outcome: "accepted" } },
        })
        await acceptCollabInvitation({ workspaceId: "ws-1", accessToken: "tok", invitationId: "inv-1" })
        expect(calls[0]!.request.input).toEqual({ invitationId: "inv-1" })
        await acceptCollabInvitation({
            workspaceId: "ws-1",
            accessToken: "tok",
            invitationId: "inv-2",
            displayName: "Binh",
        })
        expect(calls[1]!.request.input).toEqual({ invitationId: "inv-2", displayName: "Binh" })
        expect(JSON.stringify(calls[1]!.request.input)).not.toMatch(/email|phone|principal|role|grant/i)
    })

    it("refuses smuggled accepter identity claims on acceptance before transport", async () => {
        const { spy } = transportSpy({
            ok: true,
            op: "acceptInvitation",
            result: { op: "acceptInvitation", membership: { outcome: "accepted" } },
        })
        for (const claim of [
            { email: "a@b.c" },
            { verifiedEmail: "a@b.c" },
            { email_verified: true },
            { phone: "+8490" },
            { role: "owner" },
            { memberId: "m-1" },
            { principal: "p" },
            { actor: { sub: "s" } },
        ]) {
            const result = await acceptCollabInvitation(Object.assign({
                workspaceId: "ws-1",
                accessToken: "tok",
                invitationId: "inv-1",
            }, claim))
            expect(result).toMatchObject({ ok: false, kind: "invalid", retryable: false })
        }
        expect(spy).not.toHaveBeenCalled()
    })

    it("refuses smuggled claims on invite and role change while permitting their own domain fields", async () => {
        const { calls, spy } = transportSpy({
            ok: true,
            op: "inviteByEmail",
            result: { op: "inviteByEmail", membership: { outcome: "existing" } },
        })
        const smuggled = await inviteCollabMemberByEmail(Object.assign({
            workspaceId: "ws-1",
            accessToken: "tok",
            email: "p@x.y",
            role: "staff" as const,
        }, {
            principal: "p",
        }))
        expect(smuggled).toMatchObject({ ok: false, kind: "invalid" })
        const legit = await inviteCollabMemberByEmail({
            workspaceId: "ws-1",
            accessToken: "tok",
            email: "p@x.y",
            role: "staff",
        })
        expect(legit).toEqual({ ok: true, data: { outcome: "existing" } })
        expect(calls).toHaveLength(1)
    })

    it("exposes no phone invitation entry point", () => {
        const phoneExports = Object.keys(collabApi).filter((name) => name.toLowerCase().includes("phone"))
        expect(phoneExports).toEqual([])
        expect(typeof collabApi.inviteCollabMemberByEmail).toBe("function")
    })

    it("unwraps the tagged result fields into the operation's own payload", async () => {
        const { spy } = transportSpy({
            ok: true,
            op: "readGroup",
            result: {
                op: "readGroup",
                page: { group: { groupId: "g-1" }, messages: [{ messageId: "m-1" }], cards: [], nextCursor: "c-2" },
            },
        })
        const page = await readCollabGroup({ workspaceId: "ws-1", accessToken: "tok" })
        expect(page).toEqual({
            ok: true,
            data: { group: { groupId: "g-1" }, messages: [{ messageId: "m-1" }], cards: [], nextCursor: "c-2" },
        })
    })

    it("preserves the boundary's failure kind and retryability instead of flattening them", async () => {
        const { spy } = transportSpy({
            ok: false,
            failure: { op: "readTask", kind: "denied", reason: "membership", retryable: false },
        })
        const denied = await readCollabTask({ workspaceId: "ws-1", accessToken: "tok", taskId: "t-1" })
        expect(denied).toMatchObject({
            ok: false,
            code: "COLLAB_DENIED",
            reason: "membership",
            kind: "forbidden",
            retryable: false,
        })
    })

    it("marks unavailable and unknown outcomes retryable so callers reconcile rather than resend blindly", async () => {
        const { spy } = transportSpy({
            ok: false,
            failure: { op: null, kind: "unavailable", reason: "dependency", retryable: true },
        })
        const unavailable = await openCollabOffice({ workspaceId: "ws-1", accessToken: "tok" })
        expect(unavailable).toMatchObject({ ok: false, kind: "unavailable", retryable: true })
    })

    it("turns a throwing transport into a retryable unknown, never an exception", async () => {
        gateway.graphqlFields.mockRejectedValue(new Error("socket dropped"))
        const answer = await openCollabOffice({ workspaceId: "ws-1", accessToken: "tok" })
        expect(answer).toMatchObject({
            ok: false,
            code: "COLLAB_UNKNOWN",
            reason: "transport threw",
            kind: "unavailable",
            retryable: true,
        })
    })

    it("refuses unsigned and unscoped calls before any transport runs", async () => {
        const { calls, spy } = transportSpy({ ok: true, op: "openOffice", result: { op: "openOffice", office: {} } })
        const unsigned = await openCollabOffice({ workspaceId: "ws-1", accessToken: "" })
        const unscoped = await openCollabOffice({ workspaceId: "", accessToken: "tok" })
        expect(unsigned).toMatchObject({ ok: false, code: "COLLAB_UNAUTHENTICATED", kind: "refused", retryable: false })
        expect(unscoped).toMatchObject({ ok: false, code: "COLLAB_INVALID", kind: "invalid", retryable: false })
        expect(calls).toEqual([])
    })
})
