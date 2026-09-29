import type { CollabTurnState } from '../../../collab'
import type { CollabBindingView } from './office'
import type { CollabTaskQuestionView, CollabTaskView } from './tasks'

/** Kinds of task or approval turn that can raise a notice. */
export type CollabTurnKind = "task-assign" | "approval"

/** The durable notice lifecycle. */
export type CollabNoticeStatus = "raised" | "delivered" | "resolved" | "retired"

/** The exact Office target a notice opens. */
export type CollabNoticeTarget = {
    readonly groupId: string
    readonly taskId: string | null
    readonly approvalId: string | null
    readonly cardMessageId: string | null
}

/** Public projection of one durable notice row; deduped client-side by `noticeId`. */
export type CollabTurnNoticeView = {
    readonly noticeId: string
    readonly workspaceId: string
    readonly groupId: string
    readonly recipientMemberId: string
    readonly turnKind: CollabTurnKind
    readonly taskId: string | null
    readonly approvalId: string | null
    readonly turnIdentity: string
    readonly status: CollabNoticeStatus
    readonly intentKey: string
    readonly raisedAt: string
    readonly deliveredAt: string | null
    readonly resolvedAt: string | null
    readonly retiredAt: string | null
}

/** One outstanding notice paired with the live authoritative state of its turn. */
export type CollabTurnNoticeItem = {
    readonly notice: CollabTurnNoticeView
    readonly turn: CollabTurnState
    readonly target: CollabNoticeTarget
}

/** One page of the authorized notice read. */
export type CollabTurnNoticePage = {
    readonly notices: ReadonlyArray<CollabTurnNoticeItem>
    readonly nextCursor?: string
}

/** Outcome of `openNotice`; a stale notice grants no action. */
export type CollabOpenTurnNoticeOutcome = {
    readonly outcome: "open" | "handled" | "ended" | "unavailable"
    readonly notice?: CollabTurnNoticeView
    readonly turn?: CollabTurnState
    readonly target?: CollabNoticeTarget
}

/** Public projection of one member row; never carries an email, phone or principal. */
export type CollabMemberView = {
    readonly memberId: string
    readonly workspaceId: string
    readonly kind: "human" | "module"
    readonly displayName: string
    readonly role: string
    readonly status: string
}

/**
 * The membership record every member command answers under the result record's
 * `membership` field: the decided domain result plus the invitation or member row
 * after the decision, when one exists. `notAuthorized`/`notEntitled` come back as
 * non-disclosing `denied` failures, `invalidInput` as `invalid` and `lostRace` as
 * `conflict` - they never reach this shape (`contract.collab.member-invite` rev 4).
 */
export type CollabMembershipResult = {
    readonly outcome: "created" | "existing" | "accepted" | "withdrawn" | "roleChanged"
    readonly member?: CollabMemberView
}

/** Outcome of `inviteByEmail`; `existing` covers duplicate and raced submissions. */
export type CollabInviteOutcome = {
    readonly outcome: "created" | "existing"
    readonly member?: CollabMemberView
}

/** Outcome of `acceptInvitation`; `existing` replays the first committed acceptance. */
export type CollabAcceptOutcome = {
    readonly outcome: "accepted" | "existing"
    readonly member?: CollabMemberView
}

/** Outcome of `withdrawInvitation`; acceptance and withdrawal have one winner. */
export type CollabWithdrawOutcome = {
    readonly outcome: "withdrawn" | "existing"
    readonly member?: CollabMemberView
}

/** Outcome of `changeMemberRole`; `existing` is the idempotent same-role replay. */
export type CollabChangeMemberRoleOutcome = {
    readonly outcome: "roleChanged" | "existing"
    readonly member?: CollabMemberView
}

/**
 * Result of `reconcileRequest`: `matched` returns the durable binding with its
 * receiver-owned receipt, `none` proves no work exists under this intent. Read before
 * any resend; an intent that matched is never resent.
 */
export type CollabReconcileOutcome = {
    readonly outcome: "matched" | "none"
    readonly binding?: CollabBindingView
}

/** How the member's answer post bound to the exact open question (`fr.collab.ask-back`). */
export type CollabAnswerBinding = {
    /**
     * `answered`/`existing` bound the message to the question; `stale`/`not-applied`
     * left it an ordinary message; `unknown` could not be proven - retryable, never
     * implying the task continued.
     */
    readonly outcome: "answered" | "existing" | "stale" | "not-applied" | "unknown"
    readonly reason?: string
    readonly retryable?: boolean
    readonly task?: CollabTaskView
    readonly question?: CollabTaskQuestionView
}

/* ------------------------------------------------------------------ */
/* Transport seam - the one movable binding.                          */
/* ------------------------------------------------------------------ */

/** One tagged call on the transport: the session credential plus the member request. */
