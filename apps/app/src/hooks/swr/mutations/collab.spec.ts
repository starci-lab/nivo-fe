import { beforeEach, describe, expect, it, vi } from "vitest";

const { useNivoMutation, useSession, mutate } = vi.hoisted(() => ({
    useNivoMutation: vi.fn((_key: unknown, mutation: unknown) => ({ key: _key, mutation })),
    useSession: vi.fn(() => ({ state: { status: "signed-in", accessToken: "tok" } })),
    mutate: vi.fn(async () => undefined),
}));
vi.mock("../useNivoMutation", () => ({ useNivoMutation }));
vi.mock("@/modules/auth/session", () => ({ useSession }));
vi.mock("swr", () => ({ useSWRConfig: () => ({ mutate }) }));
vi.mock("@/modules/api/collab", () => ({
    acceptCollabInvitation: vi.fn(),
    changeCollabMemberRole: vi.fn(),
    inviteCollabMemberByPhone: vi.fn(),
    postCollabMessage: vi.fn(),
    pressCollabApprovalButton: vi.fn(),
    withdrawCollabInvitation: vi.fn(),
}));

import {
    useMutateCollabAcceptInvitationSwr,
    useMutateCollabChangeMemberRoleSwr,
    useMutateCollabInviteByPhoneSwr,
    useMutateCollabPostMessageSwr,
    useMutateCollabPressApprovalSwr,
    useMutateCollabWithdrawInvitationSwr,
} from "./collab";
import {
    inviteCollabMemberByPhone,
    postCollabMessage,
    pressCollabApprovalButton,
    withdrawCollabInvitation,
} from "@/modules/api/collab";

type HookShape<TInput> = { readonly key: unknown; readonly mutation: (input: TInput) => Promise<unknown> };

describe("Collab mutation ownership", () => {
    beforeEach(() => vi.clearAllMocks());

    it("keeps each command on its own press-local workspace-scoped identity", () => {
        const post = useMutateCollabPostMessageSwr("ws-1") as unknown as HookShape<unknown>;
        const press = useMutateCollabPressApprovalSwr("ws-1") as unknown as HookShape<unknown>;
        const invite = useMutateCollabInviteByPhoneSwr("ws-1") as unknown as HookShape<unknown>;
        expect(post.key).toEqual(["collab", "post", "ws-1"]);
        expect(press.key).toEqual(["collab", "press", "ws-1"]);
        expect(invite.key).toEqual(["collab", "invite", "ws-1"]);
        expect((useMutateCollabAcceptInvitationSwr("ws-1") as unknown as HookShape<unknown>).key).toEqual(["collab", "invite-accept", "ws-1"]);
        expect((useMutateCollabWithdrawInvitationSwr("ws-1") as unknown as HookShape<unknown>).key).toEqual(["collab", "invite-withdraw", "ws-1"]);
        expect((useMutateCollabChangeMemberRoleSwr("ws-1") as unknown as HookShape<unknown>).key).toEqual(["collab", "member-role", "ws-1"]);
        expect((useMutateCollabPostMessageSwr(null) as unknown as HookShape<unknown>).key).toBeNull();
    });

    it("posts a message under the caller's stable intent identity with the session token", async () => {
        vi.mocked(postCollabMessage).mockResolvedValue({ ok: true, data: { route: { kind: "not-addressed" } } } as never);
        const hook = useMutateCollabPostMessageSwr("ws-1") as unknown as HookShape<{
            readonly intentId: string;
            readonly body: string;
            readonly moduleName?: string;
            readonly answersQuestionId?: string;
        }>;
        const answer = await hook.mutation({ intentId: "intent-1", body: "@Sales draft", moduleName: "Sales", answersQuestionId: "q-1" });
        expect(postCollabMessage).toHaveBeenCalledWith({
            workspaceId: "ws-1",
            accessToken: "tok",
            intentId: "intent-1",
            body: "@Sales draft",
            moduleName: "Sales",
            answersQuestionId: "q-1",
        });
        expect(answer).toMatchObject({ ok: true });
    });

    it("revalidates every cached collab projection of the workspace after an accepted post", async () => {
        vi.mocked(postCollabMessage).mockResolvedValue({ ok: true, data: { route: { kind: "admitted" } } } as never);
        const hook = useMutateCollabPostMessageSwr("ws-1") as unknown as HookShape<{ readonly intentId: string; readonly body: string }>;
        await hook.mutation({ intentId: "i-1", body: "go" });
        expect(mutate).toHaveBeenCalledTimes(1);
        const filter = (mutate.mock.calls as ReadonlyArray<readonly unknown[]>)[0][0] as (key: unknown) => boolean;
        expect(filter(["NIVO_QUERY", "viewer", "collab", "group", "ws-1", null])).toBe(true);
        expect(filter(["NIVO_QUERY", "viewer", "collab", "tasks", "ws-1", "m-1", null, null, null, null])).toBe(true);
        expect(filter(["NIVO_QUERY", "viewer", "collab", "task", "ws-1", "t-1"])).toBe(true);
        expect(filter(["NIVO_QUERY", "viewer", "collab", "notices", "ws-1", null])).toBe(true);
        expect(filter(["NIVO_QUERY", "viewer", "collab", "office", "ws-1"])).toBe(false);
        expect(filter(["NIVO_QUERY", "viewer", "collab", "tasks", "ws-2", null, null, null, null, null])).toBe(false);
        expect(filter("opaque-string-key")).toBe(false);
    });

    it("revalidates nothing when the boundary refuses the press", async () => {
        vi.mocked(pressCollabApprovalButton).mockResolvedValue({ ok: false, code: "COLLAB_DENIED", reason: "membership", kind: "denied", retryable: false } as never);
        const hook = useMutateCollabPressApprovalSwr("ws-1") as unknown as HookShape<{ readonly approvalId: string; readonly button: "approve" }>;
        const answer = await hook.mutation({ approvalId: "a-1", button: "approve" });
        expect(pressCollabApprovalButton).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", approvalId: "a-1", button: "approve" });
        expect(answer).toMatchObject({ ok: false, kind: "denied", retryable: false });
        expect(mutate).not.toHaveBeenCalled();
    });

    it("invites, withdraws and re-roles through the membership operations scoped to the workspace", async () => {
        vi.mocked(inviteCollabMemberByPhone).mockResolvedValue({ ok: true, data: { outcome: "invited" } } as never);
        const invite = useMutateCollabInviteByPhoneSwr("ws-1") as unknown as HookShape<{ readonly phone: string; readonly role: "staff" }>;
        await invite.mutation({ phone: "+84900000000", role: "staff" });
        expect(inviteCollabMemberByPhone).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", phone: "+84900000000", role: "staff" });
        const inviteFilter = (mutate.mock.calls as ReadonlyArray<readonly unknown[]>)[0][0] as (key: unknown) => boolean;
        expect(inviteFilter(["NIVO_QUERY", "viewer", "collab", "office", "ws-1"])).toBe(true);
        expect(inviteFilter(["NIVO_QUERY", "viewer", "collab", "group", "ws-1", null])).toBe(false);

        vi.mocked(withdrawCollabInvitation).mockResolvedValue({ ok: true, data: { outcome: "withdrawn" } } as never);
        const withdraw = useMutateCollabWithdrawInvitationSwr("ws-1") as unknown as HookShape<{ readonly invitationId: string }>;
        await withdraw.mutation({ invitationId: "inv-1" });
        expect(withdrawCollabInvitation).toHaveBeenCalledWith({ workspaceId: "ws-1", accessToken: "tok", invitationId: "inv-1" });
    });
});
