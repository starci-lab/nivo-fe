import { failedWith } from "../outcome"
import { isClosedRecord, isRouteErrorName, routeFailureKind } from "../operation-route"
import { ACCOUNTING_COMMAND_RECONCILIATIONS } from "./types"
import type { AccountingApiFailureKind, AccountingApiOperation, AccountingOperationAnswer, AccountingResult, AccountingRouteName } from "./types"

/** The receiver's own result tags each route name may answer with; a command and its read share a pair. */
const ACCOUNTING_RESULT_TAGS: Readonly<Record<AccountingRouteName, Array<AccountingApiOperation>>> = {
    "accounting.admitEvidence@1": ["admitEvidence", "evidence"],
    "accounting.evidence@1": ["admitEvidence", "evidence"],
    "accounting.routine@1": ["routine", "routineResult"],
    "accounting.routineResult@1": ["routine", "routineResult"],
    "accounting.exception@1": ["exception"],
    "accounting.correct@1": ["correct"],
    "accounting.summary@1": ["summary"],
    "accounting.resultDetail@1": ["resultDetail"],
}

/** Keep route refusals in their closed outcome category and attach the command's named read. */
export const refusal = (
    operation: AccountingRouteName,
    code: string,
    reason: string,
    requestId: string | null,
): AccountingOperationAnswer<never> =>
    failedWith(
        routeFailureKind(code),
        { code, reason },
        { operation, requestId, reconciles: ACCOUNTING_COMMAND_RECONCILIATIONS[operation] ?? null },
    )

/** Preserve an unresolved effect as unknown while keeping the same request identity. */
export const unknownOutcome = (operation: AccountingRouteName, requestId: string): AccountingOperationAnswer<never> =>
    refusal(operation, "outcome_unknown", "", requestId)

/*
 * Hand the receiver's own tagged variant through unchanged.
 *
 * The variant identity, its operation tag and its payload object are verified by the caller before
 * this runs; what cannot be recovered statically is the union member, because a wire object carries
 * no type. The value therefore enters as `unknown`, which is the one starting point a single cast can
 * legitimately narrow - a cast through `unknown` would erase a shape the compiler had, and there is
 * no shape here for it to erase.
 */
/** Hand a validated receiver result through with its registered tagged variant intact. */
export const accountingServedResult = (tagged: unknown): AccountingResult => tagged as AccountingResult

/** Whether a result tag is one of the eight registered Accounting tags. */
export const isAccountingApiOperation = (value: unknown): value is AccountingApiOperation =>
    value === "admitEvidence" ||
    value === "evidence" ||
    value === "routine" ||
    value === "routineResult" ||
    value === "exception" ||
    value === "correct" ||
    value === "summary" ||
    value === "resultDetail"

/** Whether a failure name is one the receiver's closed set declares. */
export const isAccountingApiFailureKind = (value: unknown): value is AccountingApiFailureKind =>
    value === "forbidden" ||
    value === "stale-authority" ||
    value === "validation" ||
    value === "conflict" ||
    value === "outcome-unknown"

/**
 * Narrow the receiver's own outcome.
 *
 * The envelope is checked here - success or failure, the echoed operation tag - while the receiver's
 * field-level closure stays the receiver's own guarantee: its schema refuses an unknown field before
 * it answers, so a browser revalidating every field would be a second opinion about a shape it did
 * not author.
 */
export const narrowAccountingOutcome = (
    operation: AccountingRouteName,
    requestId: string,
    result: unknown,
): AccountingOperationAnswer<AccountingResult> => {
    if (!isClosedRecord(result))
        return refusal(operation, "MALFORMED_ANSWER", "The answer carries no outcome object.", requestId)
    if (result.ok === false) {
        const failure = result.failure
        if (!isClosedRecord(failure))
            return refusal(operation, "MALFORMED_ANSWER", "The refused outcome carries no failure.", requestId)
        if (!isAccountingApiFailureKind(failure.error))
            return refusal(
                operation,
                "UNEXPECTED_RESULT_TAG",
                `The receiver named the undeclared failure ${String(failure.error)}.`,
                requestId,
            )
        if (failure.error === "outcome-unknown") return unknownOutcome(operation, requestId)
        return refusal(
            operation,
            failure.error,
            typeof failure.reasonCode === "string" ? failure.reasonCode : "",
            requestId,
        )
    }
    if (result.ok !== true)
        return refusal(operation, "MALFORMED_ANSWER", "The outcome states neither success nor failure.", requestId)
    const rawResult: unknown = result.result
    if (!isClosedRecord(rawResult))
        return refusal(operation, "MALFORMED_ANSWER", "The succeeded outcome carries no result object.", requestId)
    const expected = ACCOUNTING_RESULT_TAGS[operation]
    if (!isAccountingApiOperation(rawResult.op) || !expected.includes(rawResult.op)) {
        return refusal(
            operation,
            "UNEXPECTED_RESULT_TAG",
            `The receiver answered the ${String(rawResult.op)} variant for ${operation}.`,
            requestId,
        )
    }
    if (!isClosedRecord(rawResult.payload))
        return refusal(operation, "MALFORMED_ANSWER", "The tagged result carries no payload object.", requestId)
    return { ok: true, data: accountingServedResult(rawResult) }
}

/** Narrow the route's own closed reply, keeping every non-served outcome a refusal. */
export const narrowOperationAnswer = (
    operation: AccountingRouteName,
    requestId: string,
    body: unknown,
): AccountingOperationAnswer<AccountingResult> => {
    if (!isClosedRecord(body))
        return refusal(operation, "MALFORMED_ANSWER", "The route answer is not an envelope object.", requestId)
    if (body.kind === "outcome_unknown") {
        if (body.operation !== operation || body.requestId !== requestId) {
            return refusal(
                operation,
                "ECHOED_IDENTITY_MISMATCH",
                "The unknown outcome echoes an identity this call did not send.",
                requestId,
            )
        }
        return unknownOutcome(operation, requestId)
    }
    if (body.kind === "sales_result") {
        return refusal(
            operation,
            "UNEXPECTED_RESULT_KIND",
            "The route answered the Sales result kind for an Accounting operation.",
            requestId,
        )
    }
    if (body.kind === "accounting_result") {
        if (body.operation !== operation)
            return refusal(
                operation,
                "ECHOED_IDENTITY_MISMATCH",
                "The result echoes another operation name.",
                requestId,
            )
        if (body.requestId !== requestId)
            return refusal(
                operation,
                "ECHOED_IDENTITY_MISMATCH",
                "The result echoes another stable identity.",
                requestId,
            )
        return narrowAccountingOutcome(operation, requestId, body.result)
    }
    if (isRouteErrorName(body.kind)) {
        return refusal(operation, body.kind, typeof body.reason === "string" ? body.reason : "", requestId)
    }
    return refusal(
        operation,
        "UNEXPECTED_RESULT_KIND",
        `The route answered the undeclared result kind ${String(body.kind)}.`,
        requestId,
    )
}
