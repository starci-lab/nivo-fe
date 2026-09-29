import { failedWith } from "../outcome"
import { isClosedRecord, isRouteErrorName, routeFailureKind } from "../operation-route"
import { SALES_RECONCILIATIONS } from "./types"
import type { SalesAnswer, SalesFailure, SalesOperationName, SalesQueryName, SalesRefusal, SalesRefusalCode, SalesRefusalReason } from "./types"

const SALES_INVALID_VALUE_CODE = "SALES_POLICY_VALUE_INVALID"

/** The three statuses a refused Sales request answers with; anything else is not a refusal here. */
const SALES_REFUSAL_STATUSES: ReadonlySet<string> = new Set(["denied", "conflict", "unavailable"])

/**
 * Every status a served Sales variant may carry; anything else fails closed.
 *
 * The receiver answers one closed shape, so the refusal is discriminated by its refusal CODE and not
 * by its status: `denied` is both the refusal status and the lifecycle status a readiness read echoes
 * as an observed fact, and only a result carrying a code is a refusal. An undeclared status is
 * neither, and fails closed rather than being read as a Sales state.
 */
const SALES_SERVED_STATUSES: ReadonlySet<string> = new Set([
    "completed",
    "duplicate",
    "applied",
    "denied",
    "pending",
    "outcome-unknown",
    "open",
    "won",
    "lost",
])

/** A revision a failure may disclose: a positive safe integer, never a re-spelled string. */
const isDisclosedRevision = (value: unknown): value is number =>
    typeof value === "number" && Number.isSafeInteger(value) && value > 0

/** The one registered read a mutation is reconciled by; a query is reconciled by nothing. */
const reconcilesFor = (operation: SalesOperationName): SalesQueryName | null => SALES_RECONCILIATIONS[operation] ?? null

/** The failure code one refusal reason is reported under. */
const refusalCodeFor = (reason: SalesRefusalReason): SalesRefusalCode => {
    if (reason === "DENIED") return "SALES_REFUSED_DENIED"
    if (reason === "INVALID") return "SALES_REFUSED_INVALID"
    if (reason === "CONFLICT") return "SALES_REFUSED_CONFLICT"
    return "SALES_REFUSED_UNAVAILABLE"
}

/** The one refusal reason a refused status and its receiver code name, or null when they name none. */
const refusalReasonOf = (status: string, code: string): SalesRefusalReason | null => {
    if (status === "denied") return code === SALES_INVALID_VALUE_CODE ? "INVALID" : "DENIED"
    if (status === "conflict") return "CONFLICT"
    return SALES_REFUSAL_STATUSES.has(status) ? "UNAVAILABLE" : null
}

/** The positive revision a refusal disclosed, whether it named it `currentRevision` or `revision`. */
const disclosedRevision = (detail: Readonly<Record<string, unknown>> | null): number | null => {
    if (detail === null) return null
    if (isDisclosedRevision(detail.currentRevision)) return detail.currentRevision
    return isDisclosedRevision(detail.revision) ? detail.revision : null
}

/** The non-empty item a refusal disclosed, or null when it named none. */
const disclosedItem = (detail: Readonly<Record<string, unknown>> | null): string | null =>
    detail !== null && typeof detail.item === "string" && detail.item.length > 0 ? detail.item : null

/** Preserve one route failure under Sales' operation and reconciliation context. */
export const failure = (
    operation: SalesOperationName,
    code: string,
    reason: string | null,
    requestId: string | null,
): SalesFailure =>
    failedWith(
        routeFailureKind(code),
        { code, reason: reason ?? "" },
        { operation, requestId, reconciles: reconcilesFor(operation), refusal: null },
    )

/** Keep the receiver's own disclosure: the refusal reason, and the item or revision it named. */
const salesRefusal = (reason: SalesRefusalReason, code: string, value: unknown): SalesRefusal => {
    const detail = isClosedRecord(value) ? value : null
    return { reason, code, item: disclosedItem(detail), currentRevision: disclosedRevision(detail) }
}

/** One refused result, or the failure its own status and code are not a refusal under. */
const narrowSalesRefusal = (
    operation: SalesOperationName,
    requestId: string,
    status: string,
    code: unknown,
    value: unknown,
): SalesFailure => {
    if (typeof code !== "string" || code.length === 0)
        return failure(operation, "MALFORMED_ANSWER", "The refused result carries no refusal code.", requestId)
    const reason = refusalReasonOf(status, code)
    if (reason === null)
        return failure(
            operation,
            "UNEXPECTED_RESULT_STATUS",
            `The receiver refused with the undeclared status ${status}.`,
            requestId,
        )
    return {
        ...failure(operation, refusalCodeFor(reason), null, requestId),
        refusal: salesRefusal(reason, code, value),
    }
}

/** One served variant, or the failure its own status, missing value or malformed payload is under. */
const narrowSalesServed = <TValue>(
    operation: SalesOperationName,
    requestId: string,
    status: string,
    value: unknown,
    parse: (input: unknown) => TValue | null,
): SalesAnswer<TValue> => {
    if (!SALES_SERVED_STATUSES.has(status))
        return failure(
            operation,
            "UNEXPECTED_RESULT_STATUS",
            `The receiver answered the undeclared status ${status}.`,
            requestId,
        )
    if (!isClosedRecord(value))
        return failure(operation, "MALFORMED_ANSWER", "The served variant carries no value object.", requestId)
    const parsed = parse(value)
    if (parsed === null)
        return failure(operation, "MALFORMED_ANSWER", "The served value is not this operation's payload.", requestId)
    return { ok: true, data: parsed }
}

/**
 * Narrow the receiver's own closed result.
 *
 * The receiver answers ONE shape - a status, the refusal's own code when it refused, and the value it
 * settled on - so the discriminator is that code: a result that carries one is a refusal, and its
 * status has to be one of the three refusal statuses; a result without one is a served variant, and
 * its status has to be one of the eight the receiver's own surface declares. A status outside both
 * sets fails closed rather than being read as a Sales state, and `sales_refusal` keeps the reason the
 * contract registers plus whatever the receiver disclosed beside it.
 */
const narrowSalesResult = <TValue>(
    operation: SalesOperationName,
    requestId: string,
    result: unknown,
    parse: (input: unknown) => TValue | null,
): SalesAnswer<TValue> => {
    if (!isClosedRecord(result))
        return failure(operation, "MALFORMED_ANSWER", "The served result is not a result object.", requestId)
    const status = result.status
    if (typeof status !== "string" || status.length === 0)
        return failure(operation, "MALFORMED_ANSWER", "The served result carries no status.", requestId)
    if (result.code !== undefined) return narrowSalesRefusal(operation, requestId, status, result.code, result.value)
    return narrowSalesServed<TValue>(operation, requestId, status, result.value, parse)
}

/** One served Sales result, accepted only under this call's own echoed identity. */
const narrowSalesEnvelope = <TValue>(
    operation: SalesOperationName,
    requestId: string,
    body: Readonly<Record<string, unknown>>,
    parse: (input: unknown) => TValue | null,
): SalesAnswer<TValue> => {
    if (body.operation !== operation)
        return failure(operation, "ECHOED_IDENTITY_MISMATCH", "The result echoes another operation name.", requestId)
    if (body.requestId !== requestId)
        return failure(operation, "ECHOED_IDENTITY_MISMATCH", "The result echoes another stable identity.", requestId)
    return narrowSalesResult<TValue>(operation, requestId, body.result, parse)
}

/** One outcome nobody can attest, accepted only under this call's own echoed identity. */
const narrowUnknownOutcome = (
    operation: SalesOperationName,
    requestId: string,
    body: Readonly<Record<string, unknown>>,
): SalesFailure =>
    body.operation === operation && body.requestId === requestId
        ? failure(operation, "outcome_unknown", null, requestId)
        : failure(
              operation,
              "ECHOED_IDENTITY_MISMATCH",
              "The unknown outcome echoes an identity this call did not send.",
              requestId,
          )

/** Narrow the route's own closed reply, keeping every non-served outcome a refusal. */
export const narrowSalesAnswer = <TValue>(
    operation: SalesOperationName,
    requestId: string,
    body: unknown,
    parse: (input: unknown) => TValue | null,
): SalesAnswer<TValue> => {
    if (!isClosedRecord(body))
        return failure(operation, "MALFORMED_ANSWER", "The route answer is not an envelope object.", requestId)
    if (body.kind === "outcome_unknown") return narrowUnknownOutcome(operation, requestId, body)
    if (body.kind === "sales_result") return narrowSalesEnvelope<TValue>(operation, requestId, body, parse)
    if (body.kind === "accounting_result")
        return failure(
            operation,
            "UNEXPECTED_RESULT_KIND",
            "The route answered the Accounting result kind for a Sales operation.",
            requestId,
        )
    if (isRouteErrorName(body.kind))
        return failure(operation, body.kind, typeof body.reason === "string" ? body.reason : null, requestId)
    return failure(
        operation,
        "UNEXPECTED_RESULT_KIND",
        `The route answered the undeclared result kind ${String(body.kind)}.`,
        requestId,
    )
}
