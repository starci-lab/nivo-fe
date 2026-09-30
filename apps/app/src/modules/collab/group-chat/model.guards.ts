import type {
    CollabApprovalCardView,
    CollabApprovalDecision,
    CollabApprovalView,
    CollabHumanRole,
    CollabInviteOutcome,
    CollabNoticeTarget,
    CollabOpenTurnNoticeOutcome,
    CollabTaskStatus,
} from "../../api/collab"
import { isNullableString, isOneOf, isRecord, isString } from "@nivo/api"

/**
 * The collab group-chat surface's runtime guards. The wire speaks loosely typed
 * records and native controls hand back bare strings; these are the only places
 * those shapes are proven before a domain type is claimed. A refusal is always
 * a null or a closed-set miss - the callers keep their existing fallbacks.
 */

/** Roles an invitation, a roster row or a role hint may name - the closed V1 set. */
export const COLLAB_HUMAN_ROLES: ReadonlyArray<CollabHumanRole> = ["owner", "manager", "staff"]

/** Whether one value names a V1 human role; a module role or a miss answers false. */
export const isCollabHumanRole = (value: unknown): value is CollabHumanRole =>
    isOneOf(value, COLLAB_HUMAN_ROLES)

/** The closed task lifecycle, in the order the status filter offers it. */
export const COLLAB_TASK_STATUSES: ReadonlyArray<CollabTaskStatus> = [
    "created",
    "working",
    "waiting-on-answer",
    "waiting-on-approval",
    "done",
    "rejected",
    "cancelled",
]

/** Whether a filter control value is one of the task lifecycle's closed states. */
export const isCollabTaskStatus = (value: unknown): value is CollabTaskStatus =>
    isOneOf(value, COLLAB_TASK_STATUSES)

/**
 * The settled outcome word of an `inviteByEmail` answer, or null when the answer
 * names neither shape - the caller's refused path covers every other payload.
 */
export const readCollabInviteOutcome = (payload: unknown): CollabInviteOutcome["outcome"] | null =>
    isRecord(payload) && (payload.outcome === "created" || payload.outcome === "existing")
        ? payload.outcome
        : null

const isCollabApprovalDecision = (value: unknown): value is CollabApprovalDecision =>
    value === "approve" || value === "reject"

const COLLAB_APPROVAL_CARD_STATUSES: ReadonlyArray<CollabApprovalView["status"]> = [
    "waiting",
    "approved",
    "rejected",
    "withdrawn",
]

/** Whether a press answer's card is the full projection an Office card draws. */
export const isCollabApprovalCardView = (value: unknown): value is CollabApprovalCardView =>
    isRecord(value) &&
    isString(value.approvalId) &&
    isString(value.workspaceId) &&
    isString(value.groupId) &&
    isString(value.taskId) &&
    isString(value.action) &&
    isNullableString(value.consequence) &&
    isString(value.heldActionKey) &&
    value.requiredRole === "manager-or-owner" &&
    isOneOf(value.status, COLLAB_APPROVAL_CARD_STATUSES) &&
    isNullableString(value.decidedByMemberId) &&
    (value.decision === null || isCollabApprovalDecision(value.decision)) &&
    isNullableString(value.decidedAt) &&
    isNullableString(value.releaseIntentId) &&
    isNullableString(value.cardMessageId) &&
    Array.isArray(value.buttons) &&
    value.buttons.every(isCollabApprovalDecision) &&
    isNullableString(value.decidedByDisplayName) &&
    isNullableString(value.decidedByRole)

/**
 * The settled card a `pressApprovalButton` answer carries, or null. An absent or
 * malformed card is not a decision, so it takes the caller's existing no-card
 * path - the revalidated read proves the card's state instead.
 */
export const readCollabPressCard = (payload: unknown): CollabApprovalCardView | null =>
    isRecord(payload) && isCollabApprovalCardView(payload.card) ? payload.card : null

/** The card identities an open notice's target may name - the fields the follow consumes. */
type CollabOpenNoticeTarget = Pick<CollabNoticeTarget, "approvalId" | "taskId" | "cardMessageId">

const isCollabOpenNoticeTarget = (value: unknown): value is CollabOpenNoticeTarget =>
    isRecord(value) &&
    isNullableString(value.approvalId) &&
    isNullableString(value.taskId) &&
    isNullableString(value.cardMessageId)

/** The part of an `openNotice` answer the follow reads: the outcome word and the target. */
export type CollabOpenNoticeRead = {
    readonly outcome: CollabOpenTurnNoticeOutcome["outcome"]
    readonly target?: CollabOpenNoticeTarget
}

const COLLAB_OPEN_NOTICE_OUTCOMES: ReadonlyArray<CollabOpenTurnNoticeOutcome["outcome"]> = [
    "open",
    "handled",
    "ended",
    "unavailable",
]

/**
 * The `openNotice` answer the follow consumes, or null for a payload that is not
 * the outcome record at all - the caller's unavailable path covers it. A target
 * that is present but malformed drops away, so a missing target cannot become a
 * scroll to a garbage element identity.
 */
export const readCollabOpenNotice = (payload: unknown): CollabOpenNoticeRead | null =>
    isRecord(payload) && isOneOf(payload.outcome, COLLAB_OPEN_NOTICE_OUTCOMES)
        ? {
              outcome: payload.outcome,
              ...(isCollabOpenNoticeTarget(payload.target) ? { target: payload.target } : {}),
          }
        : null
