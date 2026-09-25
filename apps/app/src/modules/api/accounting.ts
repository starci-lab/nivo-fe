import { graphql, type Result } from "./graphql";

/** Classifications accepted by the Accounting evidence intake. */
export type AccountingClassification = "income" | "expense" | "receivable" | "payable";
/** Current viewer role projected by the Accounting service. */
export type AccountingViewerRole = "owner" | "approver";

/** Narrowed immutable evidence-document projection. */
export type AccountingDocument = {
  readonly id: string;
  readonly fileName: string;
  readonly classification: AccountingClassification;
  readonly amountMinor: string;
  readonly currency: string;
  readonly periodKey: string;
  readonly status: string;
  readonly contextVersionId: string;
  readonly contextDigest: string;
};
/** Narrowed signed ledger row at the requested version. */
export type AccountingLedgerEntry = {
  readonly id: string;
  readonly documentId: string | null;
  readonly correctionOfId: string | null;
  readonly ledgerVersion: string;
  readonly periodKey: string;
  readonly signedAmountMinor: string;
  readonly currency: string;
  readonly kind: string;
  readonly reason: string | null;
  readonly createdAt: string;
};
/** Canonical Accounting period state. */
export type AccountingPeriod = { readonly periodKey: string; readonly status: string; readonly version: string; readonly closedAt: string | null };
/** Immutable reconciliation against one ledger version. */
export type AccountingReconciliation = { readonly id: string; readonly ledgerVersionH: string; readonly currency: string; readonly sourceAmountMinor: string; readonly ledgerAmountMinor: string; readonly differenceMinor: string; readonly createdAt: string };
/** Correction proposal and its distinct-approval state. */
export type AccountingCorrection = {
  readonly id: string;
  readonly sourceEntryId: string;
  readonly effectivePeriodKey: string;
  readonly signedDeltaMinor: string;
  readonly currency: string;
  readonly reason: string;
  readonly status: string;
  readonly submittedByUserId: string;
  readonly approverUserId: string;
  readonly approvedByUserId: string | null;
  readonly version: string;
  readonly approvedLedgerId: string | null;
  readonly createdAt: string;
  readonly approvedAt: string | null;
};
/** Immutable audit event exposed by the workbench. */
export type AccountingEvent = { readonly id: string; readonly operation: string; readonly aggregateType: string; readonly aggregateId: string; readonly details: Readonly<Record<string, unknown>>; readonly createdAt: string };
/** Advisory viewer capabilities that mutations re-authorize. */
export type AccountingViewerCapabilities = { readonly canApproveCorrection: boolean; readonly canSubmitCorrection: boolean; readonly reason: string; readonly viewerRole: AccountingViewerRole };
/** Connected Accounting workbench projection for one currency and version. */
export type AccountingWorkbench = {
  readonly installationId: string;
  readonly currency: string;
  readonly ledgerVersion: string;
  readonly ledgerAmountMinor: string;
  readonly capabilities: AccountingViewerCapabilities;
  readonly documents: ReadonlyArray<AccountingDocument>;
  readonly ledger: ReadonlyArray<AccountingLedgerEntry>;
  readonly periods: ReadonlyArray<AccountingPeriod>;
  readonly reconciliations: ReadonlyArray<AccountingReconciliation>;
  readonly corrections: ReadonlyArray<AccountingCorrection>;
  readonly events: ReadonlyArray<AccountingEvent>;
};
/** Immutable context identity applied to Accounting writes. */
export type AppliedAccountingContext = { readonly digest: string; readonly installationId: string; readonly snapshot: Readonly<Record<string, unknown>>; readonly versionId: string };
/** Settled receipt returned by every Accounting command. */
export type AccountingOperation = {
  readonly amountMinor: string | null;
  readonly contextVersionId: string | null;
  readonly currency: string | null;
  readonly details: Readonly<Record<string, unknown>> | null;
  readonly installationId: string;
  readonly ledgerVersion: string | null;
  readonly operation: string;
  readonly resourceId: string | null;
  readonly status: string;
};

/** Shared installation and caller-held idempotency identity. */
export type AccountingCommandBase = { readonly installationId: string; readonly requestToken: string };
/** Establish Accounting with a distinct approver. */
export type InitializeAccountingInput = AccountingCommandBase & { readonly approverUserId: string };
/** Add one classified evidence document. */
export type IngestAccountingDocumentInput = AccountingCommandBase & { readonly amountMinor: string; readonly classification: AccountingClassification; readonly contentBase64: string; readonly currency: string; readonly fileName: string; readonly mimeType: string; readonly periodKey: string };
/** Advance one exact evidence document. */
export type AccountingDocumentCommandInput = AccountingCommandBase & { readonly documentId: string };
/** Compare a signed source amount with the current ledger. */
export type ReconcileAccountingInput = AccountingCommandBase & { readonly currency: string; readonly sourceAmountMinor: string };
/** Close one canonical Accounting period. */
export type CloseAccountingPeriodInput = AccountingCommandBase & { readonly periodKey: string };
/** Submit a non-zero later-period correction proposal. */
export type SubmitAccountingCorrectionInput = AccountingCommandBase & { readonly effectivePeriodKey: string; readonly reason: string; readonly signedDeltaMinor: string; readonly sourceEntryId: string };
/** Approve one pending proposal as the distinct approver. */
export type ApproveAccountingCorrectionInput = AccountingCommandBase & { readonly correctionId: string };

type RawWorkbench = Omit<AccountingWorkbench, "documents" | "ledger" | "periods" | "reconciliations" | "corrections" | "events"> & {
  readonly documents: unknown; readonly ledger: unknown; readonly periods: unknown; readonly reconciliations: unknown; readonly corrections: unknown; readonly events: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const readString = (row: Record<string, unknown>, key: string): string => typeof row[key] === "string" ? row[key] : (() => { throw new Error(key); })();
const readNullableString = (row: Record<string, unknown>, key: string): string | null => row[key] === null ? null : readString(row, key);
const mapRows = <T,>(value: unknown, map: (row: Record<string, unknown>) => T): ReadonlyArray<T> => {
  if (!Array.isArray(value)) throw new Error("array");
  return value.map(item => { if (!isRecord(item)) throw new Error("row"); return map(item); });
};
const narrowWorkbench = (raw: RawWorkbench): Result<AccountingWorkbench> => {
  try {
    return { ok: true, data: {
      ...raw,
      documents: mapRows(raw.documents, row => ({ id: readString(row, "id"), fileName: readString(row, "file_name"), classification: readString(row, "classification") as AccountingClassification, amountMinor: readString(row, "amount_minor"), currency: readString(row, "currency"), periodKey: readString(row, "period_key"), status: readString(row, "status"), contextVersionId: readString(row, "context_version_id"), contextDigest: readString(row, "context_digest") })),
      ledger: mapRows(raw.ledger, row => ({ id: readString(row, "id"), documentId: readNullableString(row, "document_id"), correctionOfId: readNullableString(row, "correction_of_id"), ledgerVersion: readString(row, "ledger_version"), periodKey: readString(row, "period_key"), signedAmountMinor: readString(row, "signed_amount_minor"), currency: readString(row, "currency"), kind: readString(row, "kind"), reason: readNullableString(row, "reason"), createdAt: readString(row, "created_at") })),
      periods: mapRows(raw.periods, row => ({ periodKey: readString(row, "period_key"), status: readString(row, "status"), version: readString(row, "version"), closedAt: readNullableString(row, "closed_at") })),
      reconciliations: mapRows(raw.reconciliations, row => ({ id: readString(row, "id"), ledgerVersionH: readString(row, "ledger_version_h"), currency: readString(row, "currency"), sourceAmountMinor: readString(row, "source_amount_minor"), ledgerAmountMinor: readString(row, "ledger_amount_minor"), differenceMinor: readString(row, "difference_minor"), createdAt: readString(row, "created_at") })),
      corrections: mapRows(raw.corrections, row => ({ id: readString(row, "id"), sourceEntryId: readString(row, "source_entry_id"), effectivePeriodKey: readString(row, "effective_period_key"), signedDeltaMinor: readString(row, "signed_delta_minor"), currency: readString(row, "currency"), reason: readString(row, "reason"), status: readString(row, "status"), submittedByUserId: readString(row, "submitted_by_user_id"), approverUserId: readString(row, "approver_user_id"), approvedByUserId: readNullableString(row, "approved_by_user_id"), version: readString(row, "version"), approvedLedgerId: readNullableString(row, "approved_ledger_id"), createdAt: readString(row, "created_at"), approvedAt: readNullableString(row, "approved_at") })),
      events: mapRows(raw.events, row => ({ id: readString(row, "id"), operation: readString(row, "operation"), aggregateType: readString(row, "aggregate_type"), aggregateId: readString(row, "aggregate_id"), details: isRecord(row.details) ? row.details : {}, createdAt: readString(row, "created_at") }))
    }};
  } catch (error) {
    return { ok: false, code: "MALFORMED_ACCOUNTING_WORKBENCH", reason: `Malformed accounting row: ${error instanceof Error ? error.message : "unknown"}` };
  }
};

const OPERATION_RESPONSE_FIELDS = `success message error data { amountMinor contextVersionId currency details installationId ledgerVersion operation resourceId status }`;
const CONTEXT_RESPONSE_FIELDS = `success message error data { digest installationId snapshot versionId }`;
const WORKBENCH_RESPONSE_FIELDS = `success message error data { capabilities { canApproveCorrection canSubmitCorrection reason viewerRole } corrections currency documents events installationId ledger ledgerAmountMinor ledgerVersion periods reconciliations }`;
const operation = <T extends AccountingCommandBase>(name: string, inputType: string, input: T) => graphql<AccountingOperation>(`mutation ${name}($input: ${inputType}!) { ${name}(input: $input) { ${OPERATION_RESPONSE_FIELDS} } }`, { input });

/** Read the exact immutable context applied to one installation. @deprecated Transferred to fe-modules-impl 3/9 by Kernel ruling. */
export const resolveAppliedAccountingContext = (installationId: string) => graphql<AppliedAccountingContext>(`query ResolveAppliedAccountingContext($input: ResolveAppliedAccountingContextInput!) { resolveAppliedAccountingContext(input: $input) { ${CONTEXT_RESPONSE_FIELDS} } }`, { input: { installationId } });
/** Read and narrow one current or historical Accounting workbench. @deprecated Transferred to fe-modules-impl 3/9 by Kernel ruling. */
export const readAccountingWorkbench = async (installationId: string, currency: string, ledgerVersion?: string): Promise<Result<AccountingWorkbench>> => {
  const answer = await graphql<RawWorkbench>(`query ReadAccountingWorkbench($input: ReadAccountingWorkbenchInput!) { readAccountingWorkbench(input: $input) { ${WORKBENCH_RESPONSE_FIELDS} } }`, { input: { installationId, currency, ...(ledgerVersion === undefined ? {} : { ledgerVersion }) } });
  return answer.ok ? narrowWorkbench(answer.data) : answer;
};
/** Initialize Accounting through its one-root GraphQL command. @deprecated Transferred to fe-modules-impl 3/9 by Kernel ruling. */
export const initializeAccounting = (input: InitializeAccountingInput) => operation("initializeAccounting", "InitializeAccountingInput", input);
/** Ingest one evidence document through its one-root GraphQL command. @deprecated Transferred to fe-modules-impl 3/9 by Kernel ruling. */
export const ingestAccountingDocument = (input: IngestAccountingDocumentInput) => operation("ingestAccountingDocument", "IngestAccountingDocumentInput", input);
/** Submit one document for four-eyes review. @deprecated Transferred to fe-modules-impl 3/9 by Kernel ruling. */
export const submitAccountingDocument = (input: AccountingDocumentCommandInput) => operation("submitAccountingDocument", "AccountingDocumentCommandInput", input);
/** Approve one submitted document. @deprecated Transferred to fe-modules-impl 3/9 by Kernel ruling. */
export const approveAccountingDocument = (input: AccountingDocumentCommandInput) => operation("approveAccountingDocument", "AccountingDocumentCommandInput", input);
/** Post one approved document into the signed ledger. @deprecated Transferred to fe-modules-impl 3/9 by Kernel ruling. */
export const postAccountingDocument = (input: AccountingDocumentCommandInput) => operation("postAccountingDocument", "AccountingDocumentCommandInput", input);
/** Persist one signed reconciliation observation. @deprecated Transferred to fe-modules-impl 3/9 by Kernel ruling. */
export const reconcileAccounting = (input: ReconcileAccountingInput) => operation("reconcileAccounting", "ReconcileAccountingInput", input);
/** Close one canonical period. @deprecated Transferred to fe-modules-impl 3/9 by Kernel ruling. */
export const closeAccountingPeriod = (input: CloseAccountingPeriodInput) => operation("closeAccountingPeriod", "CloseAccountingPeriodInput", input);
/** Submit one zero-effect pending correction proposal. @deprecated Transferred to fe-modules-impl 3/9 by Kernel ruling. */
export const submitAccountingCorrection = (input: SubmitAccountingCorrectionInput) => operation("submitAccountingCorrection", "SubmitAccountingCorrectionInput", input);
/** Approve one correction and atomically append its delta. @deprecated Transferred to fe-modules-impl 3/9 by Kernel ruling. */
export const approveAccountingCorrection = (input: ApproveAccountingCorrectionInput) => operation("approveAccountingCorrection", "ApproveAccountingCorrectionInput", input);

/*
 * THE INSTALLATION-SCOPED ACCOUNTING OPERATION CLIENT (CONTRACT-ACC-API through
 * CONTRACT-SH-HUMAN-ROUTE).
 *
 * THE SEAM THIS FILE IS MIDWAY THROUGH. The accepted public Accounting surface is the eight
 * `accounting.*@1` operations below, addressed through the browser-to-Core installation operation
 * route. The legacy GraphQL document workbench above is NOT that surface. Its removal - together with
 * the four `AccountingWorkbench` consumers and the hooks barrel that still import it - is transferred
 * to fe-modules-impl 3/9 by Kernel ruling, so its exports stay compiled and deprecated until that
 * ordinal moves them onto the hooks built on this client.
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

/** The three installation coordinates every Accounting operation address carries. */
export type AccountingInstallationScope = {
  readonly workspaceId: string;
  readonly instanceId: string;
  readonly installationId: string;
};

/** The operation discriminator the receiver repeats on every answer, success or failure. */
export type AccountingApiOperation =
  | "admitEvidence"
  | "evidence"
  | "routine"
  | "routineResult"
  | "exception"
  | "correct"
  | "summary"
  | "resultDetail";

/** The eight registered Accounting operation names this client may address. */
export type AccountingRouteName =
  | "accounting.admitEvidence@1"
  | "accounting.evidence@1"
  | "accounting.routine@1"
  | "accounting.routineResult@1"
  | "accounting.exception@1"
  | "accounting.correct@1"
  | "accounting.summary@1"
  | "accounting.resultDetail@1";

/** The four registered Accounting reads, and the only addresses an uncertain command is reconciled through. */
export type AccountingReadName =
  | "accounting.evidence@1"
  | "accounting.routineResult@1"
  | "accounting.summary@1"
  | "accounting.resultDetail@1";

/** Closed transport failures the receiver names; they carry no protected detail. */
export type AccountingApiFailureKind = "forbidden" | "stale-authority" | "validation" | "conflict" | "outcome-unknown";

/** The closed error set the route answers by name. UNAUTHENTICATED arrives as a status, never a body. */
export type AccountingRouteError =
  | "BAD_REQUEST"
  | "REFUSED"
  | "UNSUPPORTED_OPERATION_VERSION"
  | "OPERATION_NOT_REGISTERED_FOR_INSTALLATION"
  | "CURRENT_AUTHORITY_UNAVAILABLE"
  | "CONTROLPLANE_UNAVAILABLE"
  | "DEADLINE_EXCEEDED";

/** What this browser half adds: transport conditions the route never gets to name. */
export type AccountingTransportError =
  | "UNAUTHENTICATED"
  | "UNREACHABLE"
  | "MALFORMED_ANSWER"
  | "UNEXPECTED_RESULT_KIND"
  | "UNEXPECTED_RESULT_TAG"
  | "ECHOED_IDENTITY_MISMATCH";

/** Every way one Accounting operation can be refused as uncompleted, apart from the unknown outcome. */
export type AccountingRefusalCode =
  | AccountingRouteError
  | Exclude<AccountingApiFailureKind, "outcome-unknown">
  | AccountingTransportError;

/** Closed lifecycle states for admitted evidence. */
export type AccountingEvidenceState =
  | "admitted"
  | "reading"
  | "ready"
  | "needs_information"
  | "likely_duplicate"
  | "unreadable"
  | "rejected";

/** Closed routine reservation, decision and result states. */
export type AccountingRoutineState =
  | "admitted"
  | "committed"
  | "needs-decision"
  | "pending-authority"
  | "denied"
  | "outcome-unknown";

/** Closed material-exception states after one attributable action. */
export type AccountingExceptionState = "open" | "deferred" | "escalated" | "answered" | "resolved" | "dismissed";

/** Closed forward-correction and retry states. */
export type AccountingCorrectionState =
  | "proposed"
  | "blocked"
  | "possible_start"
  | "applied"
  | "proven_not_applied"
  | "outcome_unknown";

/** Payment matching status that never infers payment from an order. */
export type AccountingMatchStatus = "unpaid" | "unmatched" | "matched" | "ambiguous";

/** Business-first measures a summary item may carry. */
export type AccountingMeasureKind =
  | "cash-in"
  | "cash-out"
  | "recognized-revenue"
  | "recognized-cost"
  | "unpaid"
  | "estimated-tax";

/** Safe reasons a summary cannot claim complete coverage. */
export type AccountingPartialReason =
  | "missing-occurred-on"
  | "missing-measure-coverage"
  | "stale-source"
  | "unavailable-source";

/** Availability label applied without fabricating a measured value. */
export type AccountingAvailability = "current" | "partial" | "stale" | "unavailable";

/** The closed set of fact names a corrected-fact field may address. */
export type AccountingCorrectedFactField =
  | "amountMinor"
  | "currency"
  | "occurredOn"
  | "counterpartyRef"
  | "matchStatus"
  | "treatment";

/** One closed tagged scalar carried by a supplied or corrected fact. */
export type AccountingFactValue =
  | { readonly kind: "text"; readonly value: string }
  | { readonly kind: "integer"; readonly value: number }
  | { readonly kind: "boolean"; readonly value: boolean }
  | { readonly kind: "local-date"; readonly value: string }
  | { readonly kind: "timestamptz"; readonly value: string }
  | { readonly kind: "money"; readonly amountMinor: number; readonly currency: string };

/** A caller-supplied fact: a name, one tagged value and attributable evidence references. */
export interface AccountingSuppliedFact {
  readonly name: string;
  readonly value: AccountingFactValue;
  readonly evidenceRefs: ReadonlyArray<string>;
}

/** A forward-correction fact: a closed field, its old and new tagged values and evidence references. */
export interface AccountingCorrectedFact {
  readonly field: AccountingCorrectedFactField;
  readonly oldValue: AccountingFactValue | null;
  readonly newValue: AccountingFactValue | null;
  readonly evidenceRefs: ReadonlyArray<string>;
}

/** A closed measure: a known measure carries amount and currency, an unknown one carries a reason. */
export type AccountingMeasurePayload =
  | { readonly kind: AccountingMeasureKind; readonly status: "known"; readonly amountMinor: number; readonly currency: string }
  | { readonly kind: AccountingMeasureKind; readonly status: "unknown"; readonly reasonCode: string };

/** A closed treatment outcome derived from configured policy. */
export type AccountingTreatmentPayload =
  | { readonly kind: "supported"; readonly code: string }
  | { readonly kind: "unsupported"; readonly reasonCode: string }
  | { readonly kind: "unknown"; readonly reasonCode: string };

/** Immutable business-first projection of one current result snapshot. */
export interface AccountingSummaryItemPayload {
  readonly itemId: string;
  readonly resultId: string;
  readonly version: number;
  readonly effectiveAt: string;
  readonly occurredOn: string | null;
  readonly currency: string | null;
  readonly measures: ReadonlyArray<AccountingMeasurePayload>;
  readonly paymentStatus: AccountingMatchStatus;
  readonly attentionCodes: ReadonlyArray<string>;
  readonly availability: AccountingAvailability;
  readonly sourceEvidenceRefs: ReadonlyArray<string>;
  readonly policyRevision: string;
  readonly receiptId: string | null;
}

/** Canonical half-open period result with explicit partial coverage and continuation. */
export interface AccountingSummaryPayload {
  readonly periodStart: string;
  readonly periodEndExclusive: string;
  readonly currency: string | null;
  readonly items: ReadonlyArray<AccountingSummaryItemPayload>;
  readonly partialReasons: ReadonlyArray<AccountingPartialReason>;
  readonly nextCursor: string | null;
}

/** Closed facts disclosed for one authorized result detail. */
export interface AccountingResultFacts {
  readonly amountMinor: number | null;
  readonly currency: string | null;
  readonly occurredOn: string | null;
  readonly counterpartyRef: string | null;
  readonly matchStatus: AccountingMatchStatus;
  readonly treatment: AccountingTreatmentPayload;
}

/** Immutable current or historical result detail with lineage. */
export interface AccountingResultDetailPayload {
  readonly resultId: string;
  readonly itemId: string;
  readonly version: number;
  readonly effectiveAt: string;
  readonly state: "current" | "historical";
  readonly facts: AccountingResultFacts;
  readonly sourceEvidenceRefs: ReadonlyArray<string>;
  readonly policyRevision: string;
  readonly receiptId: string | null;
  readonly predecessorResultId: string | null;
  readonly successorResultId: string | null;
}

/** Closed caller reference for evidence admission. */
export interface AccountingAdmitEvidenceInput {
  readonly evidenceId: string;
  readonly sourceKind: string;
  readonly sourceRef: string;
  readonly sourceRevision: string;
  readonly fingerprint: string;
  readonly expectedRevision: number;
}

/** Read-only evidence identity lookup. */
export interface AccountingEvidenceInput {
  readonly evidenceId: string;
}

/** Routine commit request bound to evidence, policy and item revision. */
export interface AccountingRoutineCommitInput {
  readonly action: "commit";
  readonly itemId: string;
  readonly evidenceIds: ReadonlyArray<string>;
  readonly intentId: string;
  readonly policyRevision: string;
  readonly expectedItemRevision: number;
  readonly materialExceptionId?: string;
}

/** Proof-referenced retry request whose fence is resolved from receiver state. */
export interface AccountingRoutineRetryInput {
  readonly action: "retry";
  readonly intentId: string;
  readonly oldAttemptId: string;
  readonly notStartedProofRef: string;
  readonly newAttemptId: string;
}

/** Closed routine commit or proof-consuming retry input. */
export type AccountingRoutineInput = AccountingRoutineCommitInput | AccountingRoutineRetryInput;

/** Read-only lookup for a stable routine intent. */
export interface AccountingRoutineResultInput {
  readonly intentId: string;
}

/** Closed attributable answer facts for one material exception. */
export interface AccountingExceptionAnswer {
  readonly choiceCode: string | null;
  readonly suppliedFacts: ReadonlyArray<AccountingSuppliedFact>;
  readonly reason: string | null;
}

/** Revision-fenced answer command for a material exception. */
export interface AccountingExceptionAnswerInput {
  readonly action: "answer";
  readonly exceptionId: string;
  readonly answer: AccountingExceptionAnswer;
  readonly answerEvidenceRefs: ReadonlyArray<string>;
  readonly expectedRevision: number;
}

/** Revision-fenced defer, reopen, escalate or dismiss command. */
export interface AccountingExceptionDispositionInput {
  readonly action: "defer" | "reopen" | "escalate" | "dismiss";
  readonly exceptionId: string;
  readonly reason: string;
  readonly expectedRevision: number;
}

/** Closed answer or non-answer material-exception action. */
export type AccountingExceptionInput = AccountingExceptionAnswerInput | AccountingExceptionDispositionInput;

/** Proposed forward correction with closed field and value changes. */
export interface AccountingCorrectProposeInput {
  readonly action: "propose";
  readonly correctionId: string;
  readonly predecessorResultId: string;
  readonly correctedFacts: ReadonlyArray<AccountingCorrectedFact>;
  readonly reason: string;
  readonly evidenceRefs: ReadonlyArray<string>;
  readonly expectedResultRevision: number;
}

/** Request to append a previously proposed correction. */
export interface AccountingCorrectAppendInput {
  readonly action: "append";
  readonly correctionId: string;
  readonly attemptId: string;
  readonly expectedRevision: number;
}

/** Proof-referenced retry of one uncertain correction attempt. */
export interface AccountingCorrectRetryInput {
  readonly action: "retry";
  readonly correctionId: string;
  readonly oldAttemptId: string;
  readonly notAppliedProofRef: string;
  readonly newAttemptId: string;
  readonly expectedRevision: number;
}

/** Closed propose, append or proof-consuming correction action. */
export type AccountingCorrectInput = AccountingCorrectProposeInput | AccountingCorrectAppendInput | AccountingCorrectRetryInput;

/** Canonical summary period, exact currency filter, page size and opaque cursor. */
export interface AccountingSummaryQueryInput {
  readonly periodStart: string;
  readonly periodEndExclusive: string;
  readonly currency: string | null;
  readonly pageSize: number;
  readonly cursor: string | null;
}

/** Current immutable result lookup by result identity. */
export interface AccountingResultDetailCurrentInput {
  readonly action: "current";
  readonly resultId: string;
}

/** Historical result lookup by item and zoned timestamp. */
export interface AccountingResultDetailAsOfInput {
  readonly action: "asOf";
  readonly itemId: string;
  readonly asOf: string;
}

/** Closed current or as-of result-detail selector. */
export type AccountingResultDetailInput = AccountingResultDetailCurrentInput | AccountingResultDetailAsOfInput;

/** Exactly one closed Accounting operation selected by its tag. */
export type AccountingRequest =
  | { readonly op: "admitEvidence"; readonly input: AccountingAdmitEvidenceInput }
  | { readonly op: "evidence"; readonly input: AccountingEvidenceInput }
  | { readonly op: "routine"; readonly input: AccountingRoutineInput }
  | { readonly op: "routineResult"; readonly input: AccountingRoutineResultInput }
  | { readonly op: "exception"; readonly input: AccountingExceptionInput }
  | { readonly op: "correct"; readonly input: AccountingCorrectInput }
  | { readonly op: "summary"; readonly input: AccountingSummaryQueryInput }
  | { readonly op: "resultDetail"; readonly input: AccountingResultDetailInput };

/** Evidence state returned without open domain facts. */
export interface AccountingEvidenceResultPayload {
  readonly evidenceId: string;
  readonly state: AccountingEvidenceState;
  readonly revision: number;
  readonly missingFacts: ReadonlyArray<string>;
}

/** Routine state and immutable receipt and result identities. */
export interface AccountingRoutineResultPayload {
  readonly intentId: string;
  readonly itemId: string | null;
  readonly attemptId: string | null;
  readonly state: AccountingRoutineState;
  readonly receiptId: string | null;
  readonly resultId: string | null;
  readonly reasonCode: string | null;
}

/** Material-exception state after one revision-fenced action. */
export interface AccountingExceptionResultPayload {
  readonly exceptionId: string;
  readonly state: AccountingExceptionState;
  readonly revision: number;
}

/** Forward-correction state and immutable lineage identities. */
export interface AccountingCorrectResultPayload {
  readonly correctionId: string;
  readonly attemptId: string;
  readonly state: AccountingCorrectionState;
  readonly resultId: string | null;
  readonly predecessorResultId: string | null;
}

/** Tagged evidence admission or read result. */
export interface AccountingEvidenceResult {
  readonly op: "admitEvidence" | "evidence";
  readonly payload: AccountingEvidenceResultPayload;
}

/** Tagged routine command or query result. */
export interface AccountingRoutineResult {
  readonly op: "routine" | "routineResult";
  readonly payload: AccountingRoutineResultPayload;
}

/** Tagged material-exception result. */
export interface AccountingExceptionResult {
  readonly op: "exception";
  readonly payload: AccountingExceptionResultPayload;
}

/** Tagged correction result. */
export interface AccountingCorrectResult {
  readonly op: "correct";
  readonly payload: AccountingCorrectResultPayload;
}

/** Tagged canonical summary result. */
export interface AccountingSummaryResult {
  readonly op: "summary";
  readonly payload: AccountingSummaryPayload;
}

/** Tagged current or historical result-detail result. */
export interface AccountingResultDetailResult {
  readonly op: "resultDetail";
  readonly payload: AccountingResultDetailPayload;
}

/** Exactly one closed result carrying the same operation meaning as its request. */
export type AccountingResult =
  | AccountingEvidenceResult
  | AccountingRoutineResult
  | AccountingExceptionResult
  | AccountingCorrectResult
  | AccountingSummaryResult
  | AccountingResultDetailResult;

/** One Accounting answer: the receiver's own tagged variant, or a refusal that names why it is unresolved. */
export type AccountingOperationAnswer<TResult extends AccountingResult> =
  | { readonly ok: true; readonly data: TResult }
  | AccountingOutcomeUnknown
  | AccountingOperationRefusal;

/** A command whose effect nobody can attest: never success, never failure, reconciled only by a read. */
export type AccountingOutcomeUnknown = {
  readonly ok: false;
  readonly code: "outcome_unknown";
  readonly operation: AccountingRouteName;
  readonly requestId: string;
  readonly reconciles: AccountingReadName | null;
};

/** An operation this client refuses to report as completed. */
export type AccountingOperationRefusal = {
  readonly ok: false;
  readonly code: AccountingRefusalCode;
  readonly operation: AccountingRouteName;
  readonly requestId: string | null;
  readonly reason: string;
  readonly reconciles: AccountingReadName | null;
};

/** The read one uncertain command is reconciled through; a command absent here registers no read. */
export const ACCOUNTING_COMMAND_RECONCILIATIONS: Readonly<Partial<Record<AccountingRouteName, AccountingReadName>>> = {
  "accounting.admitEvidence@1": "accounting.evidence@1",
  "accounting.routine@1": "accounting.routineResult@1",
  "accounting.correct@1": "accounting.resultDetail@1"
};

/** Core API address, read the way `graphql.ts` and `agentos-shell.ts` read it: one variable, one fallback. */
const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3068/graphql";

/** The registered installation operation route prefix; an absolute path, so it replaces `/graphql`. */
const OPERATION_ROUTE_PREFIX = "/api/v1/agentos/workspaces";

/** The longest stable identity the route accepts, mirroring its own bound. */
const MAXIMUM_REQUEST_ID_LENGTH = 512;

const isClosedRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/** The receiver's own result tags each route name may answer with; a command and its read share a pair. */
const ACCOUNTING_RESULT_TAGS: Readonly<Record<AccountingRouteName, Array<AccountingApiOperation>>> = {
  "accounting.admitEvidence@1": ["admitEvidence", "evidence"],
  "accounting.evidence@1": ["admitEvidence", "evidence"],
  "accounting.routine@1": ["routine", "routineResult"],
  "accounting.routineResult@1": ["routine", "routineResult"],
  "accounting.exception@1": ["exception"],
  "accounting.correct@1": ["correct"],
  "accounting.summary@1": ["summary"],
  "accounting.resultDetail@1": ["resultDetail"]
};

/** Bounded printable text; a control byte would split or hide the wire field it travels in. */
const isPrintableIdentity = (value: string): boolean =>
  value.length > 0 &&
  value.length <= MAXIMUM_REQUEST_ID_LENGTH &&
  [...value].every(character => {
    const code = character.codePointAt(0) ?? 0;
    return code >= 0x20 && code !== 0x7f;
  });

const refusal = (operation: AccountingRouteName, code: AccountingRefusalCode, reason: string, requestId: string | null): AccountingOperationRefusal => ({ ok: false, code, operation, requestId, reason, reconciles: ACCOUNTING_COMMAND_RECONCILIATIONS[operation] ?? null });

const unknownOutcome = (operation: AccountingRouteName, requestId: string): AccountingOutcomeUnknown => ({
  ok: false,
  code: "outcome_unknown",
  operation,
  requestId,
  reconciles: ACCOUNTING_COMMAND_RECONCILIATIONS[operation] ?? null
});

/*
 * Hand the receiver's own tagged variant through unchanged.
 *
 * The variant identity, its operation tag and its payload object are verified by the caller before
 * this runs; what cannot be recovered statically is the union member, because a wire object carries
 * no type. The value therefore enters as `unknown`, which is the one starting point a single cast can
 * legitimately narrow - a cast through `unknown` would erase a shape the compiler had, and there is
 * no shape here for it to erase.
 */
const accountingServedResult = (tagged: unknown): AccountingResult => tagged as AccountingResult;

/**
 * Build the one address of one operation.
 *
 * The three coordinates are percent-encoded because they are caller-held; the operation name is not,
 * because it is one of eight literal registered names and the receiver matches its `@1` version
 * separator verbatim.
 */
const accountingOperationUrl = (scope: AccountingInstallationScope, name: AccountingRouteName): string =>
  new URL(
    `${OPERATION_ROUTE_PREFIX}/${encodeURIComponent(scope.workspaceId)}/instances/${encodeURIComponent(scope.instanceId)}/installations/${encodeURIComponent(scope.installationId)}/operations/${name}`,
    CORE_API_URL
  ).toString();

/** Whether a result tag is one of the eight registered Accounting tags. */
const isAccountingApiOperation = (value: unknown): value is AccountingApiOperation =>
  value === "admitEvidence" ||
  value === "evidence" ||
  value === "routine" ||
  value === "routineResult" ||
  value === "exception" ||
  value === "correct" ||
  value === "summary" ||
  value === "resultDetail";

/** Whether a failure name is one the receiver's closed set declares. */
const isAccountingApiFailureKind = (value: unknown): value is AccountingApiFailureKind =>
  value === "forbidden" || value === "stale-authority" || value === "validation" || value === "conflict" || value === "outcome-unknown";

/** Whether a kind is one of the route's closed error names. */
const isAccountingRouteError = (value: unknown): value is AccountingRouteError =>
  value === "BAD_REQUEST" ||
  value === "REFUSED" ||
  value === "UNSUPPORTED_OPERATION_VERSION" ||
  value === "OPERATION_NOT_REGISTERED_FOR_INSTALLATION" ||
  value === "CURRENT_AUTHORITY_UNAVAILABLE" ||
  value === "CONTROLPLANE_UNAVAILABLE" ||
  value === "DEADLINE_EXCEEDED";

/**
 * Narrow the receiver's own outcome.
 *
 * The envelope is checked here - success or failure, the echoed operation tag - while the receiver's
 * field-level closure stays the receiver's own guarantee: its schema refuses an unknown field before
 * it answers, so a browser revalidating every field would be a second opinion about a shape it did
 * not author.
 */
const narrowAccountingOutcome = (operation: AccountingRouteName, requestId: string, result: unknown): AccountingOperationAnswer<AccountingResult> => {
  if (!isClosedRecord(result)) return refusal(operation, "MALFORMED_ANSWER", "The answer carries no outcome object.", requestId);
  if (result.ok === false) {
    const failure = result.failure;
    if (!isClosedRecord(failure)) return refusal(operation, "MALFORMED_ANSWER", "The refused outcome carries no failure.", requestId);
    if (!isAccountingApiFailureKind(failure.error)) return refusal(operation, "UNEXPECTED_RESULT_TAG", `The receiver named the undeclared failure ${String(failure.error)}.`, requestId);
    if (failure.error === "outcome-unknown") return unknownOutcome(operation, requestId);
    return refusal(operation, failure.error, typeof failure.reasonCode === "string" ? failure.reasonCode : "", requestId);
  }
  if (result.ok !== true) return refusal(operation, "MALFORMED_ANSWER", "The outcome states neither success nor failure.", requestId);
  const rawResult: unknown = result.result;
  if (!isClosedRecord(rawResult)) return refusal(operation, "MALFORMED_ANSWER", "The succeeded outcome carries no result object.", requestId);
  const expected = ACCOUNTING_RESULT_TAGS[operation];
  if (!isAccountingApiOperation(rawResult.op) || !expected.includes(rawResult.op)) {
    return refusal(operation, "UNEXPECTED_RESULT_TAG", `The receiver answered the ${String(rawResult.op)} variant for ${operation}.`, requestId);
  }
  if (!isClosedRecord(rawResult.payload)) return refusal(operation, "MALFORMED_ANSWER", "The tagged result carries no payload object.", requestId);
  return { ok: true, data: accountingServedResult(rawResult) };
};

/** Narrow the route's own closed reply, keeping every non-served outcome a refusal. */
const narrowOperationAnswer = (operation: AccountingRouteName, requestId: string, body: unknown): AccountingOperationAnswer<AccountingResult> => {
  if (!isClosedRecord(body)) return refusal(operation, "MALFORMED_ANSWER", "The route answer is not an envelope object.", requestId);
  if (body.kind === "outcome_unknown") {
    if (body.operation !== operation || body.requestId !== requestId) {
      return refusal(operation, "ECHOED_IDENTITY_MISMATCH", "The unknown outcome echoes an identity this call did not send.", requestId);
    }
    return unknownOutcome(operation, requestId);
  }
  if (body.kind === "sales_result") {
    return refusal(operation, "UNEXPECTED_RESULT_KIND", "The route answered the Sales result kind for an Accounting operation.", requestId);
  }
  if (body.kind === "accounting_result") {
    if (body.operation !== operation) return refusal(operation, "ECHOED_IDENTITY_MISMATCH", "The result echoes another operation name.", requestId);
    if (body.requestId !== requestId) return refusal(operation, "ECHOED_IDENTITY_MISMATCH", "The result echoes another stable identity.", requestId);
    return narrowAccountingOutcome(operation, requestId, body.result);
  }
  if (isAccountingRouteError(body.kind)) {
    return refusal(operation, body.kind, typeof body.reason === "string" ? body.reason : "", requestId);
  }
  return refusal(operation, "UNEXPECTED_RESULT_KIND", `The route answered the undeclared result kind ${String(body.kind)}.`, requestId);
};

/**
 * Send exactly one operation request, and nothing else.
 *
 * One call is one request: no loop, no timer and no re-send on a refusal. The caller replays the SAME
 * stable identity if it decides to try again, which is what keeps a replay one intent.
 */
const sendAccountingOperation = async (
  accessToken: string | null,
  scope: AccountingInstallationScope,
  operation: AccountingRouteName,
  request: AccountingRequest,
  requestId: string
): Promise<AccountingOperationAnswer<AccountingResult>> => {
  if (!isPrintableIdentity(requestId)) {
    return refusal(operation, "BAD_REQUEST", "The stable intent identity is empty, over-long or carries a control byte.", requestId);
  }
  if (accessToken === null || accessToken.length === 0) {
    return refusal(operation, "UNAUTHENTICATED", "No access token is held, so no request left the browser.", null);
  }
  let answer: Response;
  try {
    answer = await fetch(accountingOperationUrl(scope, operation), {
      method: "POST",
      credentials: "omit",
      headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, input: request })
    });
  } catch (error) {
    return refusal(operation, "UNREACHABLE", `The Core route could not be reached: ${error instanceof Error ? error.message : "unknown"}`, requestId);
  }
  if (answer.status === 401) return refusal(operation, "UNAUTHENTICATED", "Core refused the bearer token.", requestId);
  let body: unknown;
  try {
    body = await answer.json();
  } catch {
    return refusal(operation, "MALFORMED_ANSWER", "The route answer is not JSON.", requestId);
  }
  return narrowOperationAnswer(operation, requestId, body);
};

/** Read one evidence identity and its intake state. */
export const readAccountingEvidence = async (accessToken: string | null, scope: AccountingInstallationScope, input: AccountingEvidenceInput, requestId: string): Promise<AccountingOperationAnswer<AccountingEvidenceResult>> => {
  const answer = await sendAccountingOperation(accessToken, scope, "accounting.evidence@1", { op: "evidence", input }, requestId);
  if (!answer.ok) return answer;
  return answer.data.op === "admitEvidence" || answer.data.op === "evidence" ? { ok: true, data: answer.data } : refusal("accounting.evidence@1", "UNEXPECTED_RESULT_TAG", "The receiver answered a non-evidence variant.", requestId);
};

/** Read the stable state of one routine intent, the only read an uncertain routine is reconciled by. */
export const readAccountingRoutineResult = async (accessToken: string | null, scope: AccountingInstallationScope, input: AccountingRoutineResultInput, requestId: string): Promise<AccountingOperationAnswer<AccountingRoutineResult>> => {
  const answer = await sendAccountingOperation(accessToken, scope, "accounting.routineResult@1", { op: "routineResult", input }, requestId);
  if (!answer.ok) return answer;
  return answer.data.op === "routine" || answer.data.op === "routineResult" ? { ok: true, data: answer.data } : refusal("accounting.routineResult@1", "UNEXPECTED_RESULT_TAG", "The receiver answered a non-routine variant.", requestId);
};

/** Read one canonical summary period with its explicit partial coverage and continuation. */
export const readAccountingSummary = async (accessToken: string | null, scope: AccountingInstallationScope, input: AccountingSummaryQueryInput, requestId: string): Promise<AccountingOperationAnswer<AccountingSummaryResult>> => {
  const answer = await sendAccountingOperation(accessToken, scope, "accounting.summary@1", { op: "summary", input }, requestId);
  if (!answer.ok) return answer;
  return answer.data.op === "summary" ? { ok: true, data: answer.data } : refusal("accounting.summary@1", "UNEXPECTED_RESULT_TAG", "The receiver answered a non-summary variant.", requestId);
};

/** Read one current or historical result detail with its lineage. */
export const readAccountingResultDetail = async (accessToken: string | null, scope: AccountingInstallationScope, input: AccountingResultDetailInput, requestId: string): Promise<AccountingOperationAnswer<AccountingResultDetailResult>> => {
  const answer = await sendAccountingOperation(accessToken, scope, "accounting.resultDetail@1", { op: "resultDetail", input }, requestId);
  if (!answer.ok) return answer;
  return answer.data.op === "resultDetail" ? { ok: true, data: answer.data } : refusal("accounting.resultDetail@1", "UNEXPECTED_RESULT_TAG", "The receiver answered a non-result-detail variant.", requestId);
};

/** Admit one evidence item; an identical replay returns the same identity and a conflicting fingerprint is refused. */
export const commandAccountingAdmitEvidence = async (accessToken: string | null, scope: AccountingInstallationScope, input: AccountingAdmitEvidenceInput, requestId: string): Promise<AccountingOperationAnswer<AccountingEvidenceResult>> => {
  const answer = await sendAccountingOperation(accessToken, scope, "accounting.admitEvidence@1", { op: "admitEvidence", input }, requestId);
  if (!answer.ok) return answer;
  return answer.data.op === "admitEvidence" || answer.data.op === "evidence" ? { ok: true, data: answer.data } : refusal("accounting.admitEvidence@1", "UNEXPECTED_RESULT_TAG", "The receiver answered a non-evidence variant.", requestId);
};

/** Commit one routine decision, or retry an attempt with the proof that it never started. */
export const commandAccountingRoutine = async (accessToken: string | null, scope: AccountingInstallationScope, input: AccountingRoutineInput, requestId: string): Promise<AccountingOperationAnswer<AccountingRoutineResult>> => {
  const answer = await sendAccountingOperation(accessToken, scope, "accounting.routine@1", { op: "routine", input }, requestId);
  if (!answer.ok) return answer;
  return answer.data.op === "routine" || answer.data.op === "routineResult" ? { ok: true, data: answer.data } : refusal("accounting.routine@1", "UNEXPECTED_RESULT_TAG", "The receiver answered a non-routine variant.", requestId);
};

/** Answer, defer, reopen, escalate or dismiss one material exception at its exact revision. */
export const commandAccountingException = async (accessToken: string | null, scope: AccountingInstallationScope, input: AccountingExceptionInput, requestId: string): Promise<AccountingOperationAnswer<AccountingExceptionResult>> => {
  const answer = await sendAccountingOperation(accessToken, scope, "accounting.exception@1", { op: "exception", input }, requestId);
  if (!answer.ok) return answer;
  return answer.data.op === "exception" ? { ok: true, data: answer.data } : refusal("accounting.exception@1", "UNEXPECTED_RESULT_TAG", "The receiver answered a non-exception variant.", requestId);
};

/** Propose, append or proof-retry one forward correction and its single immutable lineage. */
export const commandAccountingCorrect = async (accessToken: string | null, scope: AccountingInstallationScope, input: AccountingCorrectInput, requestId: string): Promise<AccountingOperationAnswer<AccountingCorrectResult>> => {
  const answer = await sendAccountingOperation(accessToken, scope, "accounting.correct@1", { op: "correct", input }, requestId);
  if (!answer.ok) return answer;
  return answer.data.op === "correct" ? { ok: true, data: answer.data } : refusal("accounting.correct@1", "UNEXPECTED_RESULT_TAG", "The receiver answered a non-correction variant.", requestId);
};
