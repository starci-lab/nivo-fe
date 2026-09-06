"use client";

import {
  approveAccountingCorrection, approveAccountingDocument, closeAccountingPeriod, ingestAccountingDocument,
  initializeAccounting, postAccountingDocument, reconcileAccounting, submitAccountingCorrection,
  submitAccountingDocument, type AccountingDocumentCommandInput, type ApproveAccountingCorrectionInput,
  type CloseAccountingPeriodInput, type IngestAccountingDocumentInput, type InitializeAccountingInput,
  type ReconcileAccountingInput, type SubmitAccountingCorrectionInput
} from "@/modules/api/accounting";
import { useNivoMutation } from "../use-nivo-mutation";
import { accountingContextQueryKey, accountingWorkbenchQueryKey } from "../queries/accounting";

type ScopedInput<T> = Omit<T, "installationId">;
type AcceptedAnswer = { readonly ok: boolean };
const accepted = (answer: AcceptedAnswer) => answer.ok;
const invalidates = (installationId: string, currency: string) => [accountingWorkbenchQueryKey(installationId, currency)];

/** Initialize one Accounting installation and refresh its context and current statement. */
export const useMutateInitializeAccountingSwr = (installationId: string, currency: string) => useNivoMutation(["accounting", "initialize", installationId], (input: ScopedInput<InitializeAccountingInput>) => initializeAccounting({ installationId, ...input }), { invalidates: [accountingContextQueryKey(installationId), ...invalidates(installationId, currency)], shouldInvalidate: accepted });
/** Add one evidence document and refresh the current statement after acceptance. */
export const useMutateIngestAccountingDocumentSwr = (installationId: string, currency: string) => useNivoMutation(["accounting", "ingest", installationId], (input: ScopedInput<IngestAccountingDocumentInput>) => ingestAccountingDocument({ installationId, ...input }), { invalidates: invalidates(installationId, currency), shouldInvalidate: accepted });
/** Submit one document and refresh the current statement after acceptance. */
export const useMutateSubmitAccountingDocumentSwr = (installationId: string, currency: string) => useNivoMutation(["accounting", "document-submit", installationId], (input: ScopedInput<AccountingDocumentCommandInput>) => submitAccountingDocument({ installationId, ...input }), { invalidates: invalidates(installationId, currency), shouldInvalidate: accepted });
/** Approve one document and refresh the current statement after acceptance. */
export const useMutateApproveAccountingDocumentSwr = (installationId: string, currency: string) => useNivoMutation(["accounting", "document-approve", installationId], (input: ScopedInput<AccountingDocumentCommandInput>) => approveAccountingDocument({ installationId, ...input }), { invalidates: invalidates(installationId, currency), shouldInvalidate: accepted });
/** Post one document and refresh the current statement after acceptance. */
export const useMutatePostAccountingDocumentSwr = (installationId: string, currency: string) => useNivoMutation(["accounting", "document-post", installationId], (input: ScopedInput<AccountingDocumentCommandInput>) => postAccountingDocument({ installationId, ...input }), { invalidates: invalidates(installationId, currency), shouldInvalidate: accepted });
/** Reconcile one signed source amount and refresh the current statement. */
export const useMutateReconcileAccountingSwr = (installationId: string, currency: string) => useNivoMutation(["accounting", "reconcile", installationId], (input: ScopedInput<ReconcileAccountingInput>) => reconcileAccounting({ installationId, ...input }), { invalidates: invalidates(installationId, currency), shouldInvalidate: accepted });
/** Close one period and refresh the current statement after acceptance. */
export const useMutateCloseAccountingPeriodSwr = (installationId: string, currency: string) => useNivoMutation(["accounting", "period-close", installationId], (input: ScopedInput<CloseAccountingPeriodInput>) => closeAccountingPeriod({ installationId, ...input }), { invalidates: invalidates(installationId, currency), shouldInvalidate: accepted });
/** Submit one pending correction and refresh the current statement after acceptance. */
export const useMutateSubmitAccountingCorrectionSwr = (installationId: string, currency: string) => useNivoMutation(["accounting", "correction-submit", installationId], (input: ScopedInput<SubmitAccountingCorrectionInput>) => submitAccountingCorrection({ installationId, ...input }), { invalidates: invalidates(installationId, currency), shouldInvalidate: accepted });
/** Approve one correction and refresh the current statement after acceptance. */
export const useMutateApproveAccountingCorrectionSwr = (installationId: string, currency: string) => useNivoMutation(["accounting", "correction-approve", installationId], (input: ScopedInput<ApproveAccountingCorrectionInput>) => approveAccountingCorrection({ installationId, ...input }), { invalidates: invalidates(installationId, currency), shouldInvalidate: accepted });
