import type { Outcome } from "../outcome"
import { collabRequest, readResultField } from "./transport"
import { rejectAuthorityClaims } from "./commands.validation"
import type {
    CollabAnswerBinding,
    CollabPostMessageCall,
    CollabPressApprovalCall,
    CollabPressApprovalButtonOutcome,
    CollabRouteOutcome,
} from "./types"
/** The `postMessage` answer: the admission disposition plus any bound question-answer. */
export type CollabPostMessageOutcome = {
    readonly route: CollabRouteOutcome
    readonly answer?: CollabAnswerBinding
}

/**
 * `postMessage`: commit one message under its stable intent identity. The caller supplies
 * `intentId` - a resend MUST reuse the same identity, and a changed body under a reused
 * identity is a refusal, not an edit. `route` is the admission answer; `answer` carries
 * the bound question-answer when the message closed one.
 */
export const postCollabMessage = (args: CollabPostMessageCall): Promise<Outcome<CollabPostMessageOutcome>> => {
    const refused = rejectAuthorityClaims("postMessage", args, [])
    if (refused !== null) {
        return Promise.resolve(refused)
    }
    return collabRequest(
        args.accessToken,
        args.workspaceId,
        "postMessage",
        {
            intentId: args.intentId,
            body: args.body,
            ...(args.moduleName === undefined ? {} : { moduleName: args.moduleName }),
            ...(args.answersQuestionId === undefined ? {} : { answersQuestionId: args.answersQuestionId }),
        },
        (r) => ({
            route: readResultField(r, "route") as CollabRouteOutcome,
            ...(r.answer === undefined ? {} : { answer: r.answer as CollabAnswerBinding }),
        }),
    )
}

/** `pressApprovalButton`: the exact card, the exact two-button control value. */
export const pressCollabApprovalButton = (
    args: CollabPressApprovalCall,
): Promise<Outcome<CollabPressApprovalButtonOutcome>> => {
    const refused = rejectAuthorityClaims("pressApprovalButton", args, [])
    if (refused !== null) {
        return Promise.resolve(refused)
    }
    return collabRequest(
        args.accessToken,
        args.workspaceId,
        "pressApprovalButton",
        { approvalId: args.approvalId, button: args.button },
        (r) => readResultField(r, "press") as CollabPressApprovalButtonOutcome,
    )
}

/** `listTasks`: the authorized Tasks page; every filter is presentation only. */
