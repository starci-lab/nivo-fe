/**
 * The parsers of every Collab gateway result.
 *
 * One parser per result projection the named operations answer, beside the wire types they name.
 * A parser returns the freshly built value or null; `collabRequest` turns null into the existing
 * retryable `COLLAB_UNKNOWN` failure, so a malformed result is never a thrown error and never a
 * domain value under a borrowed name.
 */

import type { CollabTurnState } from "../../collab"
import {
    isBoolean, isNullableString, isNumber, isOneOf, isRecord, isString, isStringArray, parseEach,
} from "../wire"
import type {
    CollabAnswerBinding,
    CollabApprovalAnswer,
    CollabApprovalCardView,
    CollabApprovalDecision,
    CollabApprovalView,
    CollabAvailableCommandsOutcome,
    CollabBindingView,
    CollabClarificationReason,
    CollabFailureKind,
    CollabGroupRead,
    CollabGroupView,
    CollabHumanRole,
    CollabMemberView,
    CollabMembershipResult,
    CollabMessageView,
    CollabModuleParticipant,
    CollabNoticeStatus,
    CollabNoticeTarget,
    CollabOfficeParticipant,
    CollabOfficeView,
    CollabOfficeViewer,
    CollabOpenTurnNoticeOutcome,
    CollabOperation,
    CollabPressApprovalButtonOutcome,
    CollabPublishedCommand,
    CollabReadTaskOutcome,
    CollabReceiptView,
    CollabReconcileOutcome,
    CollabRouteOutcome,
    CollabTaskCardTarget,
    CollabTaskList,
    CollabTaskQuestionView,
    CollabTaskStatus,
    CollabTaskView,
    CollabTaskWaiting,
    CollabTurnKind,
    CollabTurnNoticeItem,
    CollabTurnNoticePage,
    CollabTurnNoticeView,
} from "./types"

const COLLAB_OPERATIONS: ReadonlyArray<CollabOperation> = [
    "openOffice", "readGroup", "postMessage", "pressApprovalButton", "listTasks", "readTask",
    "availableCommands", "readNotices", "openNotice", "reconcileRequest", "inviteByEmail",
    "acceptInvitation", "withdrawInvitation", "changeMemberRole",
]

/** Narrow a wire string to the closed operation vocabulary, or null. */
export const parseCollabOperation = (value: unknown): CollabOperation | null =>
    isOneOf(value, COLLAB_OPERATIONS) ? value : null

const COLLAB_FAILURE_KINDS: ReadonlyArray<CollabFailureKind> = [
    "unauthenticated", "denied", "invalid", "conflict", "unavailable", "unknown",
]

/** Whether one wire string is a boundary failure kind. */
export const isCollabFailureKind = (value: unknown): value is CollabFailureKind =>
    isOneOf(value, COLLAB_FAILURE_KINDS)

const isParticipantKind = (value: unknown): value is "human" | "module" => isOneOf(value, ["human", "module"])

const isCollabHumanRole = (value: unknown): value is CollabHumanRole => isOneOf(value, ["owner", "manager", "staff"])

const isCollabTurnKind = (value: unknown): value is CollabTurnKind => isOneOf(value, ["task-assign", "approval"])

const isCollabNoticeStatus = (value: unknown): value is CollabNoticeStatus =>
    isOneOf(value, ["raised", "delivered", "resolved", "retired"])

const isCollabTaskStatus = (value: unknown): value is CollabTaskStatus =>
    isOneOf(value, ["created", "working", "waiting-on-answer", "waiting-on-approval", "done", "rejected", "cancelled"])

const isCollabApprovalDecision = (value: unknown): value is CollabApprovalDecision => isOneOf(value, ["approve", "reject"])

const parseCollabGroupView = (value: unknown): CollabGroupView | null =>
    isRecord(value) &&
    isString(value.groupId) &&
    isString(value.workspaceId) &&
    isString(value.name) &&
    isBoolean(value.isDefaultOffice)
        ? {
              groupId: value.groupId,
              workspaceId: value.workspaceId,
              name: value.name,
              isDefaultOffice: value.isDefaultOffice,
          }
        : null

const parseCollabOfficeParticipant = (value: unknown): CollabOfficeParticipant | null =>
    isRecord(value) &&
    isString(value.memberId) &&
    isParticipantKind(value.kind) &&
    isString(value.displayName) &&
    isString(value.role) &&
    isString(value.status) &&
    isNullableString(value.moduleInstallationId)
        ? {
              memberId: value.memberId,
              kind: value.kind,
              displayName: value.displayName,
              role: value.role,
              status: value.status,
              moduleInstallationId: value.moduleInstallationId,
          }
        : null

const parseCollabOfficeViewer = (value: unknown): CollabOfficeViewer | null =>
    isRecord(value) && isString(value.memberId) && isCollabHumanRole(value.role)
        ? { memberId: value.memberId, role: value.role }
        : null

/** Parse the `office` result of `openOffice`. */
export const parseCollabOfficeView = (value: unknown): CollabOfficeView | null => {
    if (!isRecord(value)) return null
    const group = parseCollabGroupView(value.group)
    const participants = parseEach(value.participants, parseCollabOfficeParticipant)
    const viewer = parseCollabOfficeViewer(value.viewer)
    if (group === null || participants === null || viewer === null) return null
    return { group, participants, viewer }
}

const parseCollabMessageView = (value: unknown): CollabMessageView | null =>
    isRecord(value) &&
    isString(value.messageId) &&
    isString(value.workspaceId) &&
    isString(value.groupId) &&
    isParticipantKind(value.authorKind) &&
    isNullableString(value.authorMemberId) &&
    isNullableString(value.authorModuleInstallationId) &&
    isString(value.body) &&
    isString(value.intentId) &&
    isNullableString(value.addressedModuleInstallationId) &&
    isNullableString(value.addressedModuleKey) &&
    isNullableString(value.answersQuestionId) &&
    isString(value.occurredAt)
        ? {
              messageId: value.messageId,
              workspaceId: value.workspaceId,
              groupId: value.groupId,
              authorKind: value.authorKind,
              authorMemberId: value.authorMemberId,
              authorModuleInstallationId: value.authorModuleInstallationId,
              body: value.body,
              intentId: value.intentId,
              addressedModuleInstallationId: value.addressedModuleInstallationId,
              addressedModuleKey: value.addressedModuleKey,
              answersQuestionId: value.answersQuestionId,
              occurredAt: value.occurredAt,
          }
        : null

const parseCollabReceiptView = (value: unknown): CollabReceiptView | null => {
    if (!isRecord(value)) return null
    if (value.disposition === "reported" && isString(value.receiptId)) {
        return { disposition: "reported", receiptId: value.receiptId }
    }
    if (value.disposition === "not-yet-reported") return { disposition: "not-yet-reported" }
    if (value.disposition === "refused" && isNullableString(value.reason)) {
        return { disposition: "refused", reason: value.reason }
    }
    return null
}

const COLLAB_BINDING_STATUSES: ReadonlyArray<CollabBindingView["status"]> = [
    "recorded", "pending", "admitted", "refused",
]

const parseCollabBindingView = (value: unknown): CollabBindingView | null => {
    if (
        !isRecord(value) ||
        !isString(value.bindingId) ||
        !isString(value.workspaceId) ||
        !isString(value.groupId) ||
        !isString(value.sourceMessageId) ||
        !isString(value.intentId) ||
        !isString(value.receiverModuleInstallationId) ||
        !isString(value.receiverModuleKey) ||
        !isString(value.commandName) ||
        !isString(value.commandVersion) ||
        !isString(value.askerMemberId) ||
        !isNullableString(value.routingRuleId) ||
        !isOneOf(value.status, COLLAB_BINDING_STATUSES)
    ) {
        return null
    }
    const receipt = parseCollabReceiptView(value.receipt)
    if (receipt === null) return null
    return {
        bindingId: value.bindingId,
        workspaceId: value.workspaceId,
        groupId: value.groupId,
        sourceMessageId: value.sourceMessageId,
        intentId: value.intentId,
        receiverModuleInstallationId: value.receiverModuleInstallationId,
        receiverModuleKey: value.receiverModuleKey,
        commandName: value.commandName,
        commandVersion: value.commandVersion,
        askerMemberId: value.askerMemberId,
        routingRuleId: value.routingRuleId,
        status: value.status,
        receipt,
    }
}

/** Parse the `page` result of `readGroup`. */
export const parseCollabGroupRead = (value: unknown): CollabGroupRead | null => {
    if (!isRecord(value)) return null
    if (value.nextCursor !== undefined && !isString(value.nextCursor)) return null
    const group = parseCollabGroupView(value.group)
    const messages = parseEach(value.messages, parseCollabMessageView)
    const cards = parseEach(value.cards, parseCollabBindingView)
    if (group === null || messages === null || cards === null) return null
    return {
        group,
        messages,
        cards,
        ...(value.nextCursor === undefined ? {} : { nextCursor: value.nextCursor }),
    }
}

const parseCollabPublishedCommand = (value: unknown): CollabPublishedCommand | null =>
    isRecord(value) && isString(value.name) && isString(value.version)
        ? { name: value.name, version: value.version }
        : null

const parseCollabModuleParticipant = (value: unknown): CollabModuleParticipant | null =>
    isRecord(value) &&
    isString(value.memberId) &&
    isString(value.workspaceId) &&
    isString(value.displayName) &&
    isString(value.moduleInstallationId) &&
    isString(value.moduleKey) &&
    isString(value.status)
        ? {
              memberId: value.memberId,
              workspaceId: value.workspaceId,
              displayName: value.displayName,
              moduleInstallationId: value.moduleInstallationId,
              moduleKey: value.moduleKey,
              status: value.status,
          }
        : null

/** Parse the `offer` result of `availableCommands`. */
export const parseCollabAvailableCommandsOutcome = (value: unknown): CollabAvailableCommandsOutcome | null => {
    if (!isRecord(value)) return null
    if (value.status === "resolved") {
        const member = parseCollabModuleParticipant(value.member)
        const commands = parseEach(value.commands, parseCollabPublishedCommand)
        return member === null || commands === null ? null : { status: "resolved", member, commands }
    }
    if (value.status === "unresolved" && isStringArray(value.availableModules)) {
        return { status: "unresolved", availableModules: value.availableModules }
    }
    return null
}

const isCollabClarificationReason = (value: unknown): value is CollabClarificationReason =>
    isOneOf(value, ["unmatched", "ambiguous", "unsupported-version", "no-commands"])

/** Parse the `route` result of `postMessage`, discriminated by its `kind`. */
export const parseCollabRouteOutcome = (value: unknown): CollabRouteOutcome | null => {
    if (!isRecord(value)) return null
    const kind: unknown = value.kind
    if (kind === "admitted" || kind === "existing" || kind === "held" || kind === "pending" || kind === "refused") {
        const message = parseCollabMessageView(value.message)
        const binding = parseCollabBindingView(value.binding)
        return message === null || binding === null ? null : { kind, message, binding }
    }
    if (kind === "clarified") {
        const message = parseCollabMessageView(value.message)
        const clarification = parseCollabMessageView(value.clarification)
        const commands = parseEach(value.commands, parseCollabPublishedCommand)
        if (!isCollabClarificationReason(value.reason) || message === null || clarification === null || commands === null) {
            return null
        }
        return { kind: "clarified", reason: value.reason, message, clarification, commands }
    }
    if (kind === "unresolved" || kind === "not-addressed") {
        const message = parseCollabMessageView(value.message)
        if (message === null) return null
        if (value.availableModules === undefined) return { kind, message }
        return isStringArray(value.availableModules) ? { kind, message, availableModules: value.availableModules } : null
    }
    return null
}

const isCollabQuestionStatus = (value: unknown): value is CollabTaskQuestionView["status"] =>
    isOneOf(value, ["open", "answered", "superseded"])

const parseCollabTaskQuestionView = (value: unknown): CollabTaskQuestionView | null =>
    isRecord(value) &&
    isString(value.questionId) &&
    isString(value.workspaceId) &&
    isString(value.taskId) &&
    isString(value.moduleInstallationId) &&
    isString(value.body) &&
    isCollabQuestionStatus(value.status) &&
    isNullableString(value.answerMessageId) &&
    isString(value.askedAt) &&
    isNullableString(value.answeredAt)
        ? {
              questionId: value.questionId,
              workspaceId: value.workspaceId,
              taskId: value.taskId,
              moduleInstallationId: value.moduleInstallationId,
              body: value.body,
              status: value.status,
              answerMessageId: value.answerMessageId,
              askedAt: value.askedAt,
              answeredAt: value.answeredAt,
          }
        : null

const isCollabApprovalStatus = (value: unknown): value is CollabApprovalView["status"] =>
    isOneOf(value, ["waiting", "approved", "rejected", "withdrawn"])

const parseCollabApprovalView = (value: unknown): CollabApprovalView | null =>
    isRecord(value) &&
    isString(value.approvalId) &&
    isString(value.workspaceId) &&
    isString(value.groupId) &&
    isString(value.taskId) &&
    isString(value.action) &&
    isNullableString(value.consequence) &&
    isString(value.heldActionKey) &&
    value.requiredRole === "manager-or-owner" &&
    isCollabApprovalStatus(value.status) &&
    isNullableString(value.decidedByMemberId) &&
    (value.decision === null || isCollabApprovalDecision(value.decision)) &&
    isNullableString(value.decidedAt) &&
    isNullableString(value.releaseIntentId) &&
    isNullableString(value.cardMessageId)
        ? {
              approvalId: value.approvalId,
              workspaceId: value.workspaceId,
              groupId: value.groupId,
              taskId: value.taskId,
              action: value.action,
              consequence: value.consequence,
              heldActionKey: value.heldActionKey,
              requiredRole: "manager-or-owner",
              status: value.status,
              decidedByMemberId: value.decidedByMemberId,
              decision: value.decision,
              decidedAt: value.decidedAt,
              releaseIntentId: value.releaseIntentId,
              cardMessageId: value.cardMessageId,
          }
        : null

const parseCollabApprovalCardView = (value: unknown): CollabApprovalCardView | null => {
    if (
        !isRecord(value) ||
        !Array.isArray(value.buttons) ||
        !value.buttons.every(isCollabApprovalDecision) ||
        !isNullableString(value.decidedByDisplayName) ||
        !isNullableString(value.decidedByRole)
    ) {
        return null
    }
    const base = parseCollabApprovalView(value)
    if (base === null) return null
    return {
        ...base,
        buttons: value.buttons,
        decidedByDisplayName: value.decidedByDisplayName,
        decidedByRole: value.decidedByRole,
    }
}

const parseCollabTaskWaiting = (value: unknown): CollabTaskWaiting | null => {
    if (!isRecord(value)) return null
    if (value.kind === "answer") {
        const question = parseCollabTaskQuestionView(value.question)
        return question === null ? null : { kind: "answer", question }
    }
    if (value.kind === "approval") {
        const approval = parseCollabApprovalView(value.approval)
        return approval === null ? null : { kind: "approval", approval }
    }
    return null
}

const parseCollabTaskView = (value: unknown): CollabTaskView | null => {
    if (!isRecord(value)) return null
    if (
        !isString(value.taskId) ||
        !isString(value.workspaceId) ||
        !isString(value.groupId) ||
        !isNullableString(value.bindingId) ||
        !isNullableString(value.cardMessageId) ||
        !isString(value.intentId) ||
        !isString(value.statement) ||
        !isString(value.owningModuleInstallationId) ||
        !isString(value.owningModuleKey) ||
        !isNullableString(value.owningModuleDisplayName) ||
        !isString(value.askedByMemberId) ||
        !isNullableString(value.askedByDisplayName) ||
        !isNullableString(value.assignedToMemberId) ||
        !isNullableString(value.assignedToDisplayName) ||
        !isNullableString(value.routingRuleId) ||
        !isCollabTaskStatus(value.status) ||
        !isNumber(value.version) ||
        !(value.waiting === null || isRecord(value.waiting)) ||
        !(value.outcome === null || isRecord(value.outcome)) ||
        !isString(value.createdAt) ||
        !isString(value.updatedAt)
    ) {
        return null
    }
    const waiting = value.waiting === null ? null : parseCollabTaskWaiting(value.waiting)
    if (value.waiting !== null && waiting === null) return null
    return {
        taskId: value.taskId,
        workspaceId: value.workspaceId,
        groupId: value.groupId,
        bindingId: value.bindingId,
        cardMessageId: value.cardMessageId,
        intentId: value.intentId,
        statement: value.statement,
        owningModuleInstallationId: value.owningModuleInstallationId,
        owningModuleKey: value.owningModuleKey,
        owningModuleDisplayName: value.owningModuleDisplayName,
        askedByMemberId: value.askedByMemberId,
        askedByDisplayName: value.askedByDisplayName,
        assignedToMemberId: value.assignedToMemberId,
        assignedToDisplayName: value.assignedToDisplayName,
        routingRuleId: value.routingRuleId,
        status: value.status,
        version: value.version,
        waiting,
        outcome: value.outcome,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
    }
}

/** Parse the `page` result of `listTasks`. */
export const parseCollabTaskList = (value: unknown): CollabTaskList | null => {
    if (!isRecord(value)) return null
    if (value.nextCursor !== undefined && !isString(value.nextCursor)) return null
    const tasks = parseEach(value.tasks, parseCollabTaskView)
    if (tasks === null) return null
    return { tasks, ...(value.nextCursor === undefined ? {} : { nextCursor: value.nextCursor }) }
}

const parseCollabTaskCardTarget = (value: unknown): CollabTaskCardTarget | null =>
    isRecord(value) &&
    isString(value.groupId) &&
    isNullableString(value.cardMessageId) &&
    isNullableString(value.bindingId)
        ? { groupId: value.groupId, cardMessageId: value.cardMessageId, bindingId: value.bindingId }
        : null

const optionalField = <T>(value: unknown, parse: (input: unknown) => T | null): T | null | undefined =>
    value === undefined ? undefined : parse(value)

/** Parse the `read` result of `readTask`. */
export const parseCollabReadTaskOutcome = (value: unknown): CollabReadTaskOutcome | null => {
    if (!isRecord(value) || !isOneOf(value.outcome, ["found", "unavailable"])) return null
    const task = optionalField(value.task, parseCollabTaskView)
    const card = optionalField(value.card, parseCollabTaskCardTarget)
    if (task === null || card === null) return null
    return {
        outcome: value.outcome,
        ...(task === undefined ? {} : { task }),
        ...(card === undefined ? {} : { card }),
    }
}

const parseCollabApprovalAnswer = (value: unknown): CollabApprovalAnswer | null =>
    isRecord(value) &&
    isString(value.taskId) &&
    isString(value.groupId) &&
    isString(value.approvalId) &&
    isString(value.heldActionKey) &&
    isCollabApprovalDecision(value.decision) &&
    isNullableString(value.releaseIntentId) &&
    isString(value.decidedByMemberId) &&
    isNullableString(value.decidedByDisplayName) &&
    isNullableString(value.decidedByRole) &&
    isString(value.decidedAt)
        ? {
              taskId: value.taskId,
              groupId: value.groupId,
              approvalId: value.approvalId,
              heldActionKey: value.heldActionKey,
              decision: value.decision,
              releaseIntentId: value.releaseIntentId,
              decidedByMemberId: value.decidedByMemberId,
              decidedByDisplayName: value.decidedByDisplayName,
              decidedByRole: value.decidedByRole,
              decidedAt: value.decidedAt,
          }
        : null

/** Parse the `press` result of `pressApprovalButton`. */
export const parseCollabPressApprovalButtonOutcome = (value: unknown): CollabPressApprovalButtonOutcome | null => {
    if (!isRecord(value) || !isOneOf(value.outcome, ["decided", "existing", "unavailable"])) return null
    const card = optionalField(value.card, parseCollabApprovalCardView)
    const task = optionalField(value.task, parseCollabTaskView)
    const answer = optionalField(value.answer, parseCollabApprovalAnswer)
    if (card === null || task === null || answer === null) return null
    return {
        outcome: value.outcome,
        ...(card === undefined ? {} : { card }),
        ...(task === undefined ? {} : { task }),
        ...(answer === undefined ? {} : { answer }),
    }
}

/** Parse the `reconcile` result of `reconcileRequest`. */
export const parseCollabReconcileOutcome = (value: unknown): CollabReconcileOutcome | null => {
    if (!isRecord(value) || !isOneOf(value.outcome, ["matched", "none"])) return null
    const binding = optionalField(value.binding, parseCollabBindingView)
    if (binding === null) return null
    return { outcome: value.outcome, ...(binding === undefined ? {} : { binding }) }
}

/** Parse the `answer` result of `postMessage` when one is bound. */
export const parseCollabAnswerBinding = (value: unknown): CollabAnswerBinding | null => {
    if (!isRecord(value) || !isOneOf(value.outcome, ["answered", "existing", "stale", "not-applied", "unknown"])) {
        return null
    }
    if (value.reason !== undefined && !isString(value.reason)) return null
    if (value.retryable !== undefined && !isBoolean(value.retryable)) return null
    const task = optionalField(value.task, parseCollabTaskView)
    const question = optionalField(value.question, parseCollabTaskQuestionView)
    if (task === null || question === null) return null
    return {
        outcome: value.outcome,
        ...(value.reason === undefined ? {} : { reason: value.reason }),
        ...(value.retryable === undefined ? {} : { retryable: value.retryable }),
        ...(task === undefined ? {} : { task }),
        ...(question === undefined ? {} : { question }),
    }
}

const parseCollabTurnState = (value: unknown): CollabTurnState | null =>
    isRecord(value) &&
    isOneOf(value.state, ["open", "handled", "ended"]) &&
    isNullableString(value.handledByMemberId) &&
    (value.decision === null || isOneOf(value.decision, ["answered", "approve", "reject"])) &&
    isNullableString(value.handledAt)
        ? {
              state: value.state,
              handledByMemberId: value.handledByMemberId,
              decision: value.decision,
              handledAt: value.handledAt,
          }
        : null

const parseCollabNoticeTarget = (value: unknown): CollabNoticeTarget | null =>
    isRecord(value) &&
    isString(value.groupId) &&
    isNullableString(value.taskId) &&
    isNullableString(value.approvalId) &&
    isNullableString(value.cardMessageId)
        ? {
              groupId: value.groupId,
              taskId: value.taskId,
              approvalId: value.approvalId,
              cardMessageId: value.cardMessageId,
          }
        : null

const parseCollabTurnNoticeView = (value: unknown): CollabTurnNoticeView | null =>
    isRecord(value) &&
    isString(value.noticeId) &&
    isString(value.workspaceId) &&
    isString(value.groupId) &&
    isString(value.recipientMemberId) &&
    isCollabTurnKind(value.turnKind) &&
    isNullableString(value.taskId) &&
    isNullableString(value.approvalId) &&
    isString(value.turnIdentity) &&
    isCollabNoticeStatus(value.status) &&
    isString(value.intentKey) &&
    isString(value.raisedAt) &&
    isNullableString(value.deliveredAt) &&
    isNullableString(value.resolvedAt) &&
    isNullableString(value.retiredAt)
        ? {
              noticeId: value.noticeId,
              workspaceId: value.workspaceId,
              groupId: value.groupId,
              recipientMemberId: value.recipientMemberId,
              turnKind: value.turnKind,
              taskId: value.taskId,
              approvalId: value.approvalId,
              turnIdentity: value.turnIdentity,
              status: value.status,
              intentKey: value.intentKey,
              raisedAt: value.raisedAt,
              deliveredAt: value.deliveredAt,
              resolvedAt: value.resolvedAt,
              retiredAt: value.retiredAt,
          }
        : null

const parseCollabTurnNoticeItem = (value: unknown): CollabTurnNoticeItem | null => {
    if (!isRecord(value)) return null
    const notice = parseCollabTurnNoticeView(value.notice)
    const turn = parseCollabTurnState(value.turn)
    const target = parseCollabNoticeTarget(value.target)
    if (notice === null || turn === null || target === null) return null
    return { notice, turn, target }
}

/** Parse the `page` result of `readNotices`. */
export const parseCollabTurnNoticePage = (value: unknown): CollabTurnNoticePage | null => {
    if (!isRecord(value)) return null
    if (value.nextCursor !== undefined && !isString(value.nextCursor)) return null
    const notices = parseEach(value.notices, parseCollabTurnNoticeItem)
    if (notices === null) return null
    return { notices, ...(value.nextCursor === undefined ? {} : { nextCursor: value.nextCursor }) }
}

/** Parse the `notice` result of `openNotice`. */
export const parseCollabOpenTurnNoticeOutcome = (value: unknown): CollabOpenTurnNoticeOutcome | null => {
    if (!isRecord(value) || !isOneOf(value.outcome, ["open", "handled", "ended", "unavailable"])) return null
    const notice = optionalField(value.notice, parseCollabTurnNoticeView)
    const turn = optionalField(value.turn, parseCollabTurnState)
    const target = optionalField(value.target, parseCollabNoticeTarget)
    if (notice === null || turn === null || target === null) return null
    return {
        outcome: value.outcome,
        ...(notice === undefined ? {} : { notice }),
        ...(turn === undefined ? {} : { turn }),
        ...(target === undefined ? {} : { target }),
    }
}

const parseCollabMemberView = (value: unknown): CollabMemberView | null =>
    isRecord(value) &&
    isString(value.memberId) &&
    isString(value.workspaceId) &&
    isParticipantKind(value.kind) &&
    isString(value.displayName) &&
    isString(value.role) &&
    isString(value.status)
        ? {
              memberId: value.memberId,
              workspaceId: value.workspaceId,
              kind: value.kind,
              displayName: value.displayName,
              role: value.role,
              status: value.status,
          }
        : null

const COLLAB_MEMBERSHIP_OUTCOMES: ReadonlyArray<CollabMembershipResult["outcome"]> = [
    "created", "existing", "accepted", "withdrawn", "roleChanged",
]

/** Parse the `membership` result record a member command answers under. */
export const parseCollabMembershipResult = (value: unknown): CollabMembershipResult | null => {
    if (!isRecord(value) || !isOneOf(value.outcome, COLLAB_MEMBERSHIP_OUTCOMES)) return null
    const member = optionalField(value.member, parseCollabMemberView)
    if (member === null) return null
    return { outcome: value.outcome, ...(member === undefined ? {} : { member }) }
}
