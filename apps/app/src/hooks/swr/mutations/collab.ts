"use client";

import { useSWRConfig } from "swr";
import {
    acceptCollabInvitation,
    changeCollabMemberRole,
    inviteCollabMemberByPhone,
    postCollabMessage,
    pressCollabApprovalButton,
    withdrawCollabInvitation,
    type CollabApprovalDecision,
    type CollabHumanRole,
    type CollabResult,
} from "@/modules/api/collab";
import { useSession } from "@/modules/auth/session";
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation";

/**
 * Collab Office mutation ownership (`contract.collab.chat` press/post,
 * `contract.collab.member-invite`, `fr.collab.approval`).
 *
 * STABLE INTENT IS THE CALLER'S CONTRACT. A post names its `intentId` and a resend
 * MUST reuse it - a new intent is a new message, a reused intent is the same one,
 * and an uncertain transport is reconciled by `reconcileRequest`, never resent
 * blindly (`br.collab.intent-stability`).
 *
 * REVALIDATION COVERS EVERY CACHED VARIANT, NOT ONE KEY. The conversation pages by
 * cursor and the Tasks list by filter, so exact-key invalidation would leave a
 * cursored group page or a filtered Tasks list holding a stale card while the
 * unfiltered projection refreshes - two truths for one task (`br.collab.one-truth`).
 * Each mutation therefore revalidates every cached collab key of its workspace in the
 * affected domains through SWR's filter form, only after the boundary answered `ok`.
 * A refused or uncertain answer revalidates nothing the read didn't already prove.
 */

const useCollabAccessToken = (): string | null => {
    const session = useSession();
    return session.state.status === "signed-in" ? session.state.accessToken : null;
};

/** Every cached collab query key of one workspace inside these domains. */
const collabDomainKeys = (workspaceId: string, domains: ReadonlyArray<string>) => (key: unknown): boolean =>
    Array.isArray(key) && key[0] === "NIVO_QUERY" && key[2] === "collab" && key[4] === workspaceId && domains.includes(key[3] as string);

/** Revalidate the workspace's cached projections in `domains` after an accepted answer. */
const useCollabRevalidate = (workspaceId: string | null, domains: ReadonlyArray<string>) => {
    const { mutate } = useSWRConfig();
    return async (answer: CollabResult<unknown>) => {
        if (workspaceId !== null && answer.ok) {
            await mutate(collabDomainKeys(workspaceId, domains));
        }
        return answer;
    };
};

/** One Office message to post; `intentId` is the caller-owned stable resend identity. */
export type CollabPostMessageInput = {
    readonly intentId: string;
    readonly body: string;
    readonly moduleName?: string;
    readonly answersQuestionId?: string;
    readonly askerGrantScope?: Record<string, unknown>;
};

/** One button press on one exact waiting approval card. */
export type CollabPressApprovalInput = {
    readonly approvalId: string;
    readonly button: CollabApprovalDecision;
};

/** One phone invitation into exactly one V1 human role. */
export type CollabInviteByPhoneInput = {
    readonly phone: string;
    readonly role: CollabHumanRole;
};

/** One invitation consumed by the invited person. */
export type CollabAcceptInvitationInput = {
    readonly invitationId: string;
    readonly displayName?: string;
};

/** One pending invitation to close. */
export type CollabWithdrawInvitationInput = { readonly invitationId: string };

/** One member's replacement role. */
export type CollabChangeMemberRoleInput = {
    readonly memberId: string;
    readonly role: CollabHumanRole;
};

/**
 * Post one Office message under its caller-owned stable intent identity. Covers the
 * group pages, every task projection and the notice views - a post can carry a card,
 * move a task's turn and raise a notice in one commit.
 */
export const useMutateCollabPostMessageSwr = (workspaceId: string | null) => {
    const accessToken = useCollabAccessToken();
    const revalidate = useCollabRevalidate(workspaceId, ["group", "tasks", "task", "notices", "notice"]);
    const key: NivoMutationKey | null = workspaceId === null ? null : ["collab", "post", workspaceId];
    return useNivoMutation(key, (input: CollabPostMessageInput) =>
        postCollabMessage({ workspaceId: workspaceId ?? "", accessToken: accessToken ?? "", ...input }).then(revalidate));
};

/**
 * Press one exact button on one exact waiting card. `button` is a closed control
 * value - a typed message can never carry a decision - and the answer replays the
 * first recorded press on a repeated or competing press.
 */
export const useMutateCollabPressApprovalSwr = (workspaceId: string | null) => {
    const accessToken = useCollabAccessToken();
    const revalidate = useCollabRevalidate(workspaceId, ["group", "tasks", "task", "notices", "notice"]);
    const key: NivoMutationKey | null = workspaceId === null ? null : ["collab", "press", workspaceId];
    return useNivoMutation(key, (input: CollabPressApprovalInput) =>
        pressCollabApprovalButton({ workspaceId: workspaceId ?? "", accessToken: accessToken ?? "", ...input }).then(revalidate));
};

/** Invite one person by phone into exactly one V1 human role. */
export const useMutateCollabInviteByPhoneSwr = (workspaceId: string | null) => {
    const accessToken = useCollabAccessToken();
    const revalidate = useCollabRevalidate(workspaceId, ["office"]);
    const key: NivoMutationKey | null = workspaceId === null ? null : ["collab", "invite", workspaceId];
    return useNivoMutation(key, (input: CollabInviteByPhoneInput) =>
        inviteCollabMemberByPhone({ workspaceId: workspaceId ?? "", accessToken: accessToken ?? "", ...input }).then(revalidate));
};

/** Consume one invitation with the invited person's verified session. */
export const useMutateCollabAcceptInvitationSwr = (workspaceId: string | null) => {
    const accessToken = useCollabAccessToken();
    const revalidate = useCollabRevalidate(workspaceId, ["office"]);
    const key: NivoMutationKey | null = workspaceId === null ? null : ["collab", "invite-accept", workspaceId];
    return useNivoMutation(key, (input: CollabAcceptInvitationInput) =>
        acceptCollabInvitation({ workspaceId: workspaceId ?? "", accessToken: accessToken ?? "", ...input }).then(revalidate));
};

/** Close one pending invitation; acceptance and withdrawal have one atomic winner. */
export const useMutateCollabWithdrawInvitationSwr = (workspaceId: string | null) => {
    const accessToken = useCollabAccessToken();
    const revalidate = useCollabRevalidate(workspaceId, ["office"]);
    const key: NivoMutationKey | null = workspaceId === null ? null : ["collab", "invite-withdraw", workspaceId];
    return useNivoMutation(key, (input: CollabWithdrawInvitationInput) =>
        withdrawCollabInvitation({ workspaceId: workspaceId ?? "", accessToken: accessToken ?? "", ...input }).then(revalidate));
};

/** Replace one current member's role under a current Owner. */
export const useMutateCollabChangeMemberRoleSwr = (workspaceId: string | null) => {
    const accessToken = useCollabAccessToken();
    const revalidate = useCollabRevalidate(workspaceId, ["office"]);
    const key: NivoMutationKey | null = workspaceId === null ? null : ["collab", "member-role", workspaceId];
    return useNivoMutation(key, (input: CollabChangeMemberRoleInput) =>
        changeCollabMemberRole({ workspaceId: workspaceId ?? "", accessToken: accessToken ?? "", ...input }).then(revalidate));
};
