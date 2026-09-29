/*
 * THE INSTALLATION-SCOPED ACCOUNTING OPERATION CLIENT (CONTRACT-ACC-API through
 * CONTRACT-SH-HUMAN-ROUTE).
 *
 * THE SEAM IS CLOSED. The accepted public Accounting surface is the eight `accounting.*@1`
 * operations below, addressed through the browser-to-Core installation operation route. The legacy
 * GraphQL document workbench was NOT that surface; fe-modules-impl 3/9 removed it from this file,
 * from the SWR hook modules and from the hooks barrel by Kernel ruling, so nothing here resolves an
 * Accounting fact through GraphQL any more. The eight per-hook files under `hooks/swr/{queries,
 * mutations}` are the only callers, and each of their reads and commands lands on one operation
 * address below.
 *
 * FOUR PROPERTIES ARE THE POINT OF THIS HALF.
 *
 * 1. ONE OPERATION, ONE ADDRESS. Each of the eight names is exactly one POST to
 *    `/api/v1/agentos/workspaces/{workspaceId}/instances/{instanceId}/installations/{installationId}/operations/<name>@1`.
 *    The three installation coordinates are the address and nothing else - no header and no body
 *    field - so a command cannot be delivered to a sibling installation, and the receiver derives the
 *    principal from the verified token alone. The operation segment is one of eight literal
 *    registered names, so it is written verbatim: the receiver's own binding matches the `@1`
 *    version separator, which an escaped `%40` would no longer be.
 * 2. BEARER ONLY, NEVER THE COOKIE. `credentials: "omit"` keeps the refresh cookie at the Core
 *    session boundary, and the access token travels in the Authorization header only - never in a
 *    URL, browser storage or a log.
 * 3. THE STABLE INTENT IDENTITY IS THE REQUEST ID. The caller mints it once and replays the SAME
 *    identity on a retry; that is what makes a replayed command one intent rather than two.
 * 4. UNKNOWN IS NEVER SUCCESS. A route `outcome_unknown`, a receiver `outcome-unknown` failure and a
 *    DEADLINE_EXCEEDED all leave the effect unattested and name the read of the same identity that
 *    reconciles it. Nothing here promotes any of them to a completed effect, and nothing here retries
 *    on its own: one call is one request.
 */
export { ACCOUNTING_COMMAND_RECONCILIATIONS } from "./types"
export {
    commandAccountingAdmitEvidence,
    commandAccountingCorrect,
    commandAccountingException,
    commandAccountingRoutine,
    readAccountingEvidence,
    readAccountingResultDetail,
    readAccountingRoutineResult,
    readAccountingSummary,
} from "./operations"
export type {
    AccountingAdmitEvidenceInput,
    AccountingApiFailureKind,
    AccountingApiOperation,
    AccountingAvailability,
    AccountingCorrectAppendInput,
    AccountingCorrectInput,
    AccountingCorrectProposeInput,
    AccountingCorrectResult,
    AccountingCorrectResultPayload,
    AccountingCorrectRetryInput,
    AccountingCorrectedFact,
    AccountingCorrectedFactField,
    AccountingCorrectionState,
    AccountingEvidenceInput,
    AccountingEvidenceResult,
    AccountingEvidenceResultPayload,
    AccountingEvidenceState,
    AccountingExceptionAnswer,
    AccountingExceptionAnswerInput,
    AccountingExceptionDispositionInput,
    AccountingExceptionInput,
    AccountingExceptionResult,
    AccountingExceptionResultPayload,
    AccountingExceptionState,
    AccountingFactValue,
    AccountingFailureDetail,
    AccountingInstallationScope,
    AccountingMatchStatus,
    AccountingMeasureKind,
    AccountingMeasurePayload,
    AccountingOperationAnswer,
    AccountingPartialReason,
    AccountingReadName,
    AccountingRequest,
    AccountingResult,
    AccountingResultDetailAsOfInput,
    AccountingResultDetailCurrentInput,
    AccountingResultDetailInput,
    AccountingResultDetailPayload,
    AccountingResultDetailResult,
    AccountingResultFacts,
    AccountingRouteName,
    AccountingRoutineCommitInput,
    AccountingRoutineInput,
    AccountingRoutineResult,
    AccountingRoutineResultInput,
    AccountingRoutineResultPayload,
    AccountingRoutineRetryInput,
    AccountingRoutineState,
    AccountingSuppliedFact,
    AccountingSummaryItemPayload,
    AccountingSummaryPayload,
    AccountingSummaryQueryInput,
    AccountingSummaryResult,
    AccountingTreatmentPayload,
} from "./types"
