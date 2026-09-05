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

const OPERATION_FIELDS = `amountMinor contextVersionId currency details installationId ledgerVersion operation resourceId status`;
const operation = <T extends AccountingCommandBase>(name: string, inputType: string, input: T) => graphql<AccountingOperation>(`mutation ${name}($input: ${inputType}!) { ${name}(input: $input) { ${OPERATION_FIELDS} } }`, { input });

/** Read the exact immutable context applied to one installation. */
export const resolveAppliedAccountingContext = (installationId: string) => graphql<AppliedAccountingContext>(`query ResolveAppliedAccountingContext($input: ResolveAppliedAccountingContextInput!) { resolveAppliedAccountingContext(input: $input) { digest installationId snapshot versionId } }`, { input: { installationId } });
/** Read and narrow one current or historical Accounting workbench. */
export const readAccountingWorkbench = async (installationId: string, currency: string, ledgerVersion?: string): Promise<Result<AccountingWorkbench>> => {
  const answer = await graphql<RawWorkbench>(`query ReadAccountingWorkbench($input: ReadAccountingWorkbenchInput!) { readAccountingWorkbench(input: $input) { capabilities { canApproveCorrection canSubmitCorrection reason viewerRole } corrections currency documents events installationId ledger ledgerAmountMinor ledgerVersion periods reconciliations } }`, { input: { installationId, currency, ...(ledgerVersion === undefined ? {} : { ledgerVersion }) } });
  return answer.ok ? narrowWorkbench(answer.data) : answer;
};
/** Initialize Accounting through its one-root GraphQL command. */
export const initializeAccounting = (input: InitializeAccountingInput) => operation("initializeAccounting", "InitializeAccountingInput", input);
/** Ingest one evidence document through its one-root GraphQL command. */
export const ingestAccountingDocument = (input: IngestAccountingDocumentInput) => operation("ingestAccountingDocument", "IngestAccountingDocumentInput", input);
/** Submit one document for four-eyes review. */
export const submitAccountingDocument = (input: AccountingDocumentCommandInput) => operation("submitAccountingDocument", "AccountingDocumentCommandInput", input);
/** Approve one submitted document. */
export const approveAccountingDocument = (input: AccountingDocumentCommandInput) => operation("approveAccountingDocument", "AccountingDocumentCommandInput", input);
/** Post one approved document into the signed ledger. */
export const postAccountingDocument = (input: AccountingDocumentCommandInput) => operation("postAccountingDocument", "AccountingDocumentCommandInput", input);
/** Persist one signed reconciliation observation. */
export const reconcileAccounting = (input: ReconcileAccountingInput) => operation("reconcileAccounting", "ReconcileAccountingInput", input);
/** Close one canonical period. */
export const closeAccountingPeriod = (input: CloseAccountingPeriodInput) => operation("closeAccountingPeriod", "CloseAccountingPeriodInput", input);
/** Submit one zero-effect pending correction proposal. */
export const submitAccountingCorrection = (input: SubmitAccountingCorrectionInput) => operation("submitAccountingCorrection", "SubmitAccountingCorrectionInput", input);
/** Approve one correction and atomically append its delta. */
export const approveAccountingCorrection = (input: ApproveAccountingCorrectionInput) => operation("approveAccountingCorrection", "ApproveAccountingCorrectionInput", input);
