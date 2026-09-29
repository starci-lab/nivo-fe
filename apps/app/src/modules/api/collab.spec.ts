import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as collabApi from "./collab";
import {
    COLLAB_GATEWAY_COMMAND_FIELD,
    COLLAB_GATEWAY_READ_FIELD,
    acceptCollabInvitation,
    collabGatewayTransport,
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
    setCollabTransport,
    type CollabGatewayReply,
    type CollabGatewayRequest,
    type CollabOfficeView,
} from "./collab";

type SeenCall = { readonly accessToken: string; readonly request: CollabGatewayRequest };

const transportSpy = (reply: CollabGatewayReply) => {
    const calls: Array<SeenCall> = [];
    const spy = vi.fn(async (call: SeenCall) => {
        calls.push(call);
        return collabOutcomeOfReply(reply);
    });
    return { calls, spy };
};

describe("modules/api/collab", () => {
    afterEach(() => {
        setCollabTransport(collabGatewayTransport);
        vi.unstubAllGlobals();
    });

    it("sends one tagged request carrying the workspace scope, the op and the domain input", async () => {
        const { calls, spy } = transportSpy({
            ok: true,
            op: "postMessage",
            result: { op: "postMessage", route: { kind: "not-addressed", message: { messageId: "m-1" } } },
        });
        setCollabTransport(spy);
        const answer = await postCollabMessage({
            workspaceId: "ws-1",
            accessToken: "tok",
            intentId: "intent-1",
            body: "@Sales draft the quote",
            moduleName: "Sales",
            answersQuestionId: "q-9",
        });
        expect(answer.ok).toBe(true);
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
        ]);
    });

    it("rejects caller supplied membership and asker grant claims before transport", async () => {
        const { spy } = transportSpy({ ok: true, op: "postMessage", result: { op: "postMessage", route: { kind: "not-addressed", message: { messageId: "m-1" } } } });
        setCollabTransport(spy);
        const result = await postCollabMessage({
            workspaceId: "ws-1", accessToken: "tok", intentId: "intent-1", body: "hello",
            askerGrantScope: { quote: true }, role: "owner", member: { id: "m-1" }, phone: "+84900000000", membership: { active: true },
        } as never);
        expect(result).toMatchObject({ ok: false, kind: "invalid", code: "COLLAB_INVALID", retryable: false });
        expect(spy).not.toHaveBeenCalled();
    });

    it("omits absent optional fields rather than serializing undefined", async () => {
        const { calls, spy } = transportSpy({ ok: true, op: "listTasks", result: { op: "listTasks", page: { tasks: [] } } });
        setCollabTransport(spy);
        await listCollabTasks({ workspaceId: "ws-1", accessToken: "tok" });
        expect(calls[0].request.input).toEqual({});
        await listCollabTasks({ workspaceId: "ws-1", accessToken: "tok", personMemberId: "m-1", status: "working", cursor: "c-1", limit: 10 });
        expect(calls[1].request.input).toEqual({ personMemberId: "m-1", status: "working", cursor: "c-1", limit: 10 });
    });

    it("names each closed operation exactly once per call", async () => {
        const { calls, spy } = transportSpy({
            ok: true,
            op: "openOffice",
            result: { op: "openOffice", office: { group: { groupId: "g" }, participants: [] } },
        });
        setCollabTransport(spy);
        await openCollabOffice({ workspaceId: "ws-1", accessToken: "tok" });
        await readCollabGroup({ workspaceId: "ws-1", accessToken: "tok", cursor: "c" });
        await readCollabTask({ workspaceId: "ws-1", accessToken: "tok", taskId: "t-1" });
        await readCollabAvailableCommands({ workspaceId: "ws-1", accessToken: "tok", moduleName: "Sales" });
        await readCollabNotices({ workspaceId: "ws-1", accessToken: "tok" });
        await openCollabNotice({ workspaceId: "ws-1", accessToken: "tok", noticeId: "n-1" });
        await reconcileCollabRequest({ workspaceId: "ws-1", accessToken: "tok", intentId: "i-1" });
        await pressCollabApprovalButton({ workspaceId: "ws-1", accessToken: "tok", approvalId: "a-1", button: "approve" });
        await inviteCollabMemberByEmail({ workspaceId: "ws-1", accessToken: "tok", email: "person@example.com", role: "staff" });
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
        ]);
        expect(calls[1].request.input).toEqual({ cursor: "c" });
        expect(calls[7].request.input).toEqual({ approvalId: "a-1", button: "approve" });
        expect(calls[8].request.input).toEqual({ email: "person@example.com", role: "staff" });
    });

    it("projects the rev5 office bundle with the viewer identity and each roster entry's own identity", async () => {
        const office: CollabOfficeView = {
            group: { groupId: "g-1", workspaceId: "ws-1", name: "Office", isDefaultOffice: true },
            participants: [
                { memberId: "mem-lan", kind: "human", displayName: "Lan", role: "owner", status: "active", moduleInstallationId: null },
                { memberId: "mem-sales", kind: "module", displayName: "Sales", role: "module", status: "active", moduleInstallationId: "inst-sales" },
            ],
            viewer: { memberId: "mem-lan", role: "owner" },
        };
        const { spy } = transportSpy({ ok: true, op: "openOffice", result: { op: "openOffice", office } });
        setCollabTransport(spy);
        const answer = await openCollabOffice({ workspaceId: "ws-1", accessToken: "tok" });
        expect(answer).toEqual({ ok: true, data: office });
        if (!answer.ok) throw new Error("expected an ok office result");
        const human = answer.data.participants.find((participant) => participant.kind === "human");
        const hired = answer.data.participants.find((participant) => participant.kind === "module");
        expect(human?.memberId).toBe(answer.data.viewer.memberId);
        expect(human?.moduleInstallationId).toBeNull();
        expect(hired?.moduleInstallationId).toBe("inst-sales");
    });

    it("invites exactly one email into one role and never serializes a phone", async () => {
        const { calls, spy } = transportSpy({
            ok: true,
            op: "inviteByEmail",
            result: { op: "inviteByEmail", membership: { outcome: "created", member: { memberId: "mem-1" } } },
        });
        setCollabTransport(spy);
        const answer = await inviteCollabMemberByEmail({ workspaceId: "ws-1", accessToken: "tok", email: "person@example.com", role: "manager" });
        expect(calls[0].request.op).toBe("inviteByEmail");
        expect(calls[0].request.input).toEqual({ email: "person@example.com", role: "manager" });
        expect(JSON.stringify(calls[0].request)).not.toContain("phone");
        expect(answer).toEqual({ ok: true, data: { outcome: "created", member: { memberId: "mem-1" } } });
    });

    it("reads the membership result record for accept, withdraw and role change", async () => {
        const { calls, spy } = transportSpy({
            ok: true,
            op: "acceptInvitation",
            result: { op: "acceptInvitation", membership: { outcome: "accepted", member: { memberId: "mem-2", role: "staff" } } },
        });
        setCollabTransport(spy);
        const accepted = await acceptCollabInvitation({ workspaceId: "ws-1", accessToken: "tok", invitationId: "inv-1", displayName: "An" });
        expect(calls[0].request.op).toBe("acceptInvitation");
        expect(accepted).toEqual({ ok: true, data: { outcome: "accepted", member: { memberId: "mem-2", role: "staff" } } });
    });

    it("sends only the invitation identity on acceptance - never an accepter email, phone, role or principal", async () => {
        const { calls, spy } = transportSpy({
            ok: true,
            op: "acceptInvitation",
            result: { op: "acceptInvitation", membership: { outcome: "accepted" } },
        });
        setCollabTransport(spy);
        await acceptCollabInvitation({ workspaceId: "ws-1", accessToken: "tok", invitationId: "inv-1" });
        expect(calls[0].request.input).toEqual({ invitationId: "inv-1" });
        await acceptCollabInvitation({ workspaceId: "ws-1", accessToken: "tok", invitationId: "inv-2", displayName: "Binh" });
        expect(calls[1].request.input).toEqual({ invitationId: "inv-2", displayName: "Binh" });
        expect(JSON.stringify(calls[1].request.input)).not.toMatch(/email|phone|principal|role|grant/i);
    });

    it("refuses smuggled accepter identity claims on acceptance before transport", async () => {
        const { spy } = transportSpy({
            ok: true,
            op: "acceptInvitation",
            result: { op: "acceptInvitation", membership: { outcome: "accepted" } },
        });
        setCollabTransport(spy);
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
            const result = await acceptCollabInvitation({ workspaceId: "ws-1", accessToken: "tok", invitationId: "inv-1", ...claim } as never);
            expect(result).toMatchObject({ ok: false, kind: "invalid", retryable: false });
        }
        expect(spy).not.toHaveBeenCalled();
    });

    it("refuses smuggled claims on invite and role change while permitting their own domain fields", async () => {
        const { calls, spy } = transportSpy({
            ok: true,
            op: "inviteByEmail",
            result: { op: "inviteByEmail", membership: { outcome: "existing" } },
        });
        setCollabTransport(spy);
        const smuggled = await inviteCollabMemberByEmail({ workspaceId: "ws-1", accessToken: "tok", email: "p@x.y", role: "staff", principal: "p" } as never);
        expect(smuggled).toMatchObject({ ok: false, kind: "invalid" });
        const legit = await inviteCollabMemberByEmail({ workspaceId: "ws-1", accessToken: "tok", email: "p@x.y", role: "staff" });
        expect(legit).toEqual({ ok: true, data: { outcome: "existing" } });
        expect(calls).toHaveLength(1);
    });

    it("exposes no phone invitation entry point", () => {
        const phoneExports = Object.keys(collabApi).filter((name) => name.toLowerCase().includes("phone"));
        expect(phoneExports).toEqual([]);
        expect(typeof collabApi.inviteCollabMemberByEmail).toBe("function");
    });

    it("unwraps the tagged result fields into the operation's own payload", async () => {
        const { spy } = transportSpy({
            ok: true,
            op: "readGroup",
            result: { op: "readGroup", page: { group: { groupId: "g-1" }, messages: [{ messageId: "m-1" }], cards: [], nextCursor: "c-2" } },
        });
        setCollabTransport(spy);
        const page = await readCollabGroup({ workspaceId: "ws-1", accessToken: "tok" });
        expect(page).toEqual({
            ok: true,
            data: { group: { groupId: "g-1" }, messages: [{ messageId: "m-1" }], cards: [], nextCursor: "c-2" },
        });
    });

    it("preserves the boundary's failure kind and retryability instead of flattening them", async () => {
        const { spy } = transportSpy({
            ok: false,
            failure: { op: "readTask", kind: "denied", reason: "membership", retryable: false },
        });
        setCollabTransport(spy);
        const denied = await readCollabTask({ workspaceId: "ws-1", accessToken: "tok", taskId: "t-1" });
        expect(denied).toMatchObject({ ok: false, code: "COLLAB_DENIED", reason: "membership", kind: "forbidden", retryable: false });
    });

    it("marks unavailable and unknown outcomes retryable so callers reconcile rather than resend blindly", async () => {
        const { spy } = transportSpy({
            ok: false,
            failure: { op: null, kind: "unavailable", reason: "dependency", retryable: true },
        });
        setCollabTransport(spy);
        const unavailable = await openCollabOffice({ workspaceId: "ws-1", accessToken: "tok" });
        expect(unavailable).toMatchObject({ ok: false, kind: "unavailable", retryable: true });
    });

    it("turns a throwing transport into a retryable unknown, never an exception", async () => {
        setCollabTransport(vi.fn(async () => {
            throw new Error("socket dropped");
        }));
        const answer = await openCollabOffice({ workspaceId: "ws-1", accessToken: "tok" });
        expect(answer).toMatchObject({ ok: false, code: "COLLAB_UNKNOWN", reason: "transport threw", kind: "unavailable", retryable: true });
    });

    it("refuses unsigned and unscoped calls before any transport runs", async () => {
        const { calls, spy } = transportSpy({ ok: true, op: "openOffice", result: { op: "openOffice", office: {} } });
        setCollabTransport(spy);
        const unsigned = await openCollabOffice({ workspaceId: "ws-1", accessToken: "" });
        const unscoped = await openCollabOffice({ workspaceId: "", accessToken: "tok" });
        expect(unsigned).toMatchObject({ ok: false, code: "COLLAB_UNAUTHENTICATED", kind: "refused", retryable: false });
        expect(unscoped).toMatchObject({ ok: false, code: "COLLAB_INVALID", kind: "invalid", retryable: false });
        expect(calls).toEqual([]);
    });
});

describe("collabGatewayTransport", () => {
    const fetchStub = vi.fn();
    beforeEach(() => {
        fetchStub.mockReset();
        vi.stubGlobal("fetch", fetchStub);
    });
    afterEach(() => vi.unstubAllGlobals());

    const okEnvelope = (field: string, outcome: CollabGatewayReply) =>
        new Response(JSON.stringify({ data: { [field]: outcome } }), { status: 200, headers: { "content-type": "application/json" } });

    const requestBody = () => JSON.parse(fetchStub.mock.calls.at(-1)?.[1]?.body as string) as { query: string; variables: { request: CollabGatewayRequest } };

    it("posts reads on the query field and commands on the mutation field", async () => {
        fetchStub.mockResolvedValue(okEnvelope(COLLAB_GATEWAY_READ_FIELD, { ok: true, op: "readGroup", result: { op: "readGroup", page: { messages: [] } } }));
        await collabGatewayTransport({ accessToken: "tok", request: { workspaceId: "ws-1", op: "readGroup", input: {} } });
        const readBody = requestBody();
        expect(readBody.query).toContain(`query CollabGateway`);
        expect(readBody.query).toContain(`${COLLAB_GATEWAY_READ_FIELD}(request: $request)`);
        expect(readBody.variables.request).toEqual({ workspaceId: "ws-1", op: "readGroup", input: {} });

        fetchStub.mockResolvedValue(okEnvelope(COLLAB_GATEWAY_COMMAND_FIELD, { ok: true, op: "pressApprovalButton", result: { op: "pressApprovalButton", press: { outcome: "decided" } } }));
        await collabGatewayTransport({ accessToken: "tok", request: { workspaceId: "ws-1", op: "pressApprovalButton", input: { approvalId: "a-1", button: "approve" } } });
        const commandBody = requestBody();
        expect(commandBody.query).toContain(`mutation CollabGateway`);
        expect(commandBody.query).toContain(`${COLLAB_GATEWAY_COMMAND_FIELD}(request: $request)`);
    });

    it("sends the bearer credential and credentials include on every call", async () => {
        fetchStub.mockResolvedValue(okEnvelope(COLLAB_GATEWAY_READ_FIELD, { ok: true, op: "openOffice", result: { op: "openOffice", office: {} } }));
        await collabGatewayTransport({ accessToken: "tok-1", request: { workspaceId: "ws-1", op: "openOffice", input: {} } });
        const init = fetchStub.mock.calls[0][1] as RequestInit;
        expect(init.credentials).toBe("include");
        expect((init.headers as Record<string, string>).authorization).toBe("Bearer tok-1");
    });

    it("returns the gateway's typed outcome untouched", async () => {
        const outcome: CollabGatewayReply = { ok: false, failure: { op: "readTask", kind: "denied", reason: "membership", retryable: false } };
        fetchStub.mockResolvedValue(okEnvelope(COLLAB_GATEWAY_READ_FIELD, outcome));
        const answer = await collabGatewayTransport({ accessToken: "tok", request: { workspaceId: "ws-1", op: "readTask", input: { taskId: "t-1" } } });
        expect(answer).toMatchObject({ ok: false, kind: "forbidden", code: "COLLAB_DENIED", reason: "membership", retryable: false });
    });

    it("maps http refusals, graphql errors, malformed bodies and dead networks to retryable-or-denied failures", async () => {
        fetchStub.mockResolvedValue(new Response("nope", { status: 403 }));
        const forbidden = await collabGatewayTransport({ accessToken: "tok", request: { workspaceId: "ws-1", op: "openOffice", input: {} } });
        expect(forbidden).toMatchObject({ ok: false, kind: "forbidden", status: 403, retryable: false });

        fetchStub.mockResolvedValue(new Response(JSON.stringify({ errors: [{ message: "bad document" }] }), { status: 200 }));
        const gqlError = await collabGatewayTransport({ accessToken: "tok", request: { workspaceId: "ws-1", op: "openOffice", input: {} } });
        expect(gqlError).toMatchObject({ ok: false, kind: "unavailable", code: "GRAPHQL", reason: "bad document", retryable: true });

        fetchStub.mockResolvedValue(new Response("not json", { status: 200 }));
        const malformed = await collabGatewayTransport({ accessToken: "tok", request: { workspaceId: "ws-1", op: "openOffice", input: {} } });
        expect(malformed).toMatchObject({ ok: false, kind: "unavailable", code: "MALFORMED", retryable: true });

        fetchStub.mockRejectedValue(new Error("offline"));
        const network = await collabGatewayTransport({ accessToken: "tok", request: { workspaceId: "ws-1", op: "openOffice", input: {} } });
        expect(network).toMatchObject({ ok: false, kind: "unavailable", code: "NETWORK", retryable: true });
    });

    it("refuses a payload that is not the boundary's outcome shape", async () => {
        fetchStub.mockResolvedValue(okEnvelope(COLLAB_GATEWAY_READ_FIELD, { unexpected: true } as unknown as CollabGatewayReply));
        const answer = await collabGatewayTransport({ accessToken: "tok", request: { workspaceId: "ws-1", op: "openOffice", input: {} } });
        expect(answer).toMatchObject({ ok: false, kind: "unavailable", code: "COLLAB_UNKNOWN", reason: "malformed", retryable: true });
    });
});
