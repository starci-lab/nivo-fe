import type { CollabApprovalDecision, CollabTaskStatus } from './tasks'

/** Workspace and session scope carried by every Collab operation. */
export type CollabCallScope = {
    readonly workspaceId: string
    readonly accessToken: string
}

/** `readGroup`/`readNotices` page parameters. */
export type CollabPageCall = CollabCallScope & {
    readonly cursor?: string
    readonly limit?: number
}

/** `postMessage`: the caller-owned intent identity is mandatory and reused on resend. */
export type CollabPostMessageCall = CollabCallScope & {
    readonly intentId: string
    readonly body: string
    readonly moduleName?: string
    readonly answersQuestionId?: string
}

/** `pressApprovalButton`: the exact card and the exact closed button value. */
export type CollabPressApprovalCall = CollabCallScope & {
    readonly approvalId: string
    readonly button: CollabApprovalDecision
}

/** `listTasks`: presentation filters only; they narrow the view, never the grant. */
export type CollabListTasksCall = CollabCallScope & {
    readonly personMemberId?: string
    readonly moduleInstallationId?: string
    readonly status?: CollabTaskStatus
    readonly cursor?: string
    readonly limit?: number
}

/** `readTask`: one exact task identity. */
export type CollabReadTaskCall = CollabCallScope & { readonly taskId: string }

/** `availableCommands`: the `@` name as typed, with or without the prefix. */
export type CollabCommandsCall = CollabCallScope & { readonly moduleName: string }

/** `openNotice`: one exact notice identity. */
export type CollabOpenNoticeCall = CollabCallScope & { readonly noticeId: string }

/** `reconcileRequest`: one stable intent identity to check before resend. */
export type CollabReconcileCall = CollabCallScope & { readonly intentId: string }

/** The three human roles a V1 invitation or role change may name. */
export type CollabHumanRole = "owner" | "manager" | "staff"

/**
 * `inviteByEmail`: the invitee's email and its one role. The email is domain input
 * naming the invited person, never the actor - normalization (trim, case) is the
 * boundary's job, not this adapter's.
 */
export type CollabInviteCall = CollabCallScope & {
    readonly email: string
    readonly role: CollabHumanRole
}

/**
 * `acceptInvitation`: the invitation identity and optional display name. The accepting
 * email is the bearer's Login-verified email derived by the ingress - this call can
 * never carry an accepter email, phone, role, grant or principal.
 */
export type CollabAcceptInvitationCall = CollabCallScope & {
    readonly invitationId: string
    readonly displayName?: string
}

/** `withdrawInvitation`: the pending invitation identity to close. */
export type CollabWithdrawInvitationCall = CollabCallScope & { readonly invitationId: string }

/** `changeMemberRole`: the member identity and its replacement role. */
export type CollabChangeRoleCall = CollabCallScope & {
    readonly memberId: string
    readonly role: CollabHumanRole
}

/** `openOffice`: a current member lands in the one Office group with its roster and viewer identity. */
