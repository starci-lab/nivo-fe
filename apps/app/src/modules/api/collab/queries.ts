import { type Outcome } from "@nivo/api"
import { collabRequest } from "./transport"
import {
    parseCollabAvailableCommandsOutcome,
    parseCollabGroupRead,
    parseCollabOfficeView,
    parseCollabOpenTurnNoticeOutcome,
    parseCollabReadTaskOutcome,
    parseCollabReconcileOutcome,
    parseCollabTaskList,
    parseCollabTurnNoticePage,
} from "./payload.guards"
import type {
    CollabAvailableCommandsOutcome,
    CollabCallScope,
    CollabCommandsCall,
    CollabGroupRead,
    CollabListTasksCall,
    CollabOfficeView,
    CollabOpenNoticeCall,
    CollabOpenTurnNoticeOutcome,
    CollabPageCall,
    CollabReadTaskCall,
    CollabReadTaskOutcome,
    CollabReconcileCall,
    CollabReconcileOutcome,
    CollabTaskList,
    CollabTurnNoticePage,
} from "./types"

/** Opens the current member's Office view and viewer identity. */
export const openCollabOffice = (args: CollabCallScope): Promise<Outcome<CollabOfficeView>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "openOffice",
        {},
        (r) => parseCollabOfficeView(r.office),
    )

/** `readGroup`: the authorized conversation page under a resumable cursor. */
export const readCollabGroup = (args: CollabPageCall): Promise<Outcome<CollabGroupRead>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "readGroup",
        {
            ...(args.cursor === undefined ? {} : { cursor: args.cursor }),
            ...(args.limit === undefined ? {} : { limit: args.limit }),
        },
        (r) => parseCollabGroupRead(r.page),
    )

/** The `postMessage` answer: the admission disposition plus any bound question-answer. */

export const listCollabTasks = (args: CollabListTasksCall): Promise<Outcome<CollabTaskList>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "listTasks",
        {
            ...(args.personMemberId === undefined ? {} : { personMemberId: args.personMemberId }),
            ...(args.moduleInstallationId === undefined ? {} : { moduleInstallationId: args.moduleInstallationId }),
            ...(args.status === undefined ? {} : { status: args.status }),
            ...(args.cursor === undefined ? {} : { cursor: args.cursor }),
            ...(args.limit === undefined ? {} : { limit: args.limit }),
        },
        (r) => parseCollabTaskList(r.page),
    )

/** `readTask`: the same authoritative task the Office card reads, plus its card target. */
export const readCollabTask = (args: CollabReadTaskCall): Promise<Outcome<CollabReadTaskOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "readTask",
        { taskId: args.taskId },
        (r) => parseCollabReadTaskOutcome(r.read),
    )

/** `availableCommands`: resolve one typed `@` name to its published command set. */
export const readCollabAvailableCommands = (
    args: CollabCommandsCall,
): Promise<Outcome<CollabAvailableCommandsOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "availableCommands",
        { moduleName: args.moduleName },
        (r) => parseCollabAvailableCommandsOutcome(r.offer),
    )

/** `readNotices`: the member's outstanding turn notices under a resumable cursor. */
export const readCollabNotices = (args: CollabPageCall): Promise<Outcome<CollabTurnNoticePage>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "readNotices",
        {
            ...(args.cursor === undefined ? {} : { cursor: args.cursor }),
            ...(args.limit === undefined ? {} : { limit: args.limit }),
        },
        (r) => parseCollabTurnNoticePage(r.page),
    )

/** `openNotice`: follow one named notice to its live authoritative target. */
export const openCollabNotice = (args: CollabOpenNoticeCall): Promise<Outcome<CollabOpenTurnNoticeOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "openNotice",
        { noticeId: args.noticeId },
        (r) => parseCollabOpenTurnNoticeOutcome(r.notice),
    )

/**
 * `reconcileRequest`: the same-intent read a caller takes before any resend after an
 * uncertain submit. `matched` returns the durable binding and its receiver-owned
 * receipt; an intent that committed is never resent.
 */
export const reconcileCollabRequest = (args: CollabReconcileCall): Promise<Outcome<CollabReconcileOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "reconcileRequest",
        { intentId: args.intentId },
        (r) => parseCollabReconcileOutcome(r.reconcile),
    )

/* ------------------------------------------------------------------ */
/* Membership operations - the member-invite contract ops. The ingress */
/* orchestrates them into the membership boundary and answers them     */
/* under the result record's `membership` field.                       */
/* ------------------------------------------------------------------ */

/** `inviteByEmail`: one invitation naming exactly one V1 human role. */
