"use client";

import {
  approveAccountingCorrection, approveAccountingDocument, closeAccountingPeriod, commandAccountingAdmitEvidence,
  commandAccountingCorrect, commandAccountingException, commandAccountingRoutine, ingestAccountingDocument,
  initializeAccounting, postAccountingDocument, reconcileAccounting, submitAccountingCorrection,
  submitAccountingDocument, type AccountingCorrectInput, type AccountingExceptionInput, type AccountingResult,
  type AccountingAdmitEvidenceInput, type AccountingOperationAnswer, type AccountingRoutineInput,
  type AccountingInstallationScope, type AccountingDocumentCommandInput, type ApproveAccountingCorrectionInput,
  type CloseAccountingPeriodInput, type IngestAccountingDocumentInput, type InitializeAccountingInput,
  type ReconcileAccountingInput, type SubmitAccountingCorrectionInput
} from "@/modules/api/accounting";
import { useSession } from "@/modules/auth/session";
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation";
import {
  accountingContextQueryKey, accountingEvidenceQueryKey, accountingResultDetailQueryKey,
  accountingRoutineResultQueryKey, accountingWorkbenchQueryKey
} from "../queries/accounting";

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

/*
 * THE INSTALLATION-SCOPED ACCOUNTING COMMANDS.
 *
 * One press is one call, and it carries the stable intent identity that press minted under its own
 * requestId - so a replayed press is the same intent rather than a second one, and an answer nobody
 * can attest is never turned into a completion here.
 *
 * THE READ EACH PRESS OWES IS THE WHOLE INVALIDATION. A served result confirms the effect, and an
 * unknown outcome is exactly what the matching read of the same identity resolves; both invalidate
 * that read, and nothing else is touched. A refusal invalidates nothing: no effect was disclosed, so
 * there is nothing new to read.
 */

/** The signed-in access token, or null when no session holds one. */
const useAccountingAccessToken = () => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};

/** One press of an Accounting command: the receiver's own input plus the stable identity it replays under. */
export type AccountingCommandTrigger<TInput> = { readonly requestId: string; readonly input: TInput };

/** The press-local identity of one Accounting command inside one installation. */
const accountingCommandMutationKey = (name: string, scope: AccountingInstallationScope): NivoMutationKey => ["accounting", name, scope.workspaceId, scope.instanceId, scope.installationId];

/** Whether an answer still owes a read: a served result confirms it, and an unknown outcome only a read resolves. */
const accountingAnswerNeedsRead = (answer: AccountingOperationAnswer<AccountingResult>): boolean => answer.ok || answer.code === "outcome_unknown";

/** Admit one evidence item and refresh the evidence identity it names. */
export const useMutateAccountingAdmitEvidenceSwr = (scope: AccountingInstallationScope) => {
  const accessToken = useAccountingAccessToken();
  return useNivoMutation(accountingCommandMutationKey("admit-evidence", scope), (trigger: AccountingCommandTrigger<AccountingAdmitEvidenceInput>) => commandAccountingAdmitEvidence(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [accountingEvidenceQueryKey(scope, { evidenceId: trigger.input.evidenceId })], shouldInvalidate: accountingAnswerNeedsRead });
};

/** Commit one routine decision, or retry an attempt with the proof that it never started. */
export const useMutateAccountingRoutineSwr = (scope: AccountingInstallationScope) => {
  const accessToken = useAccountingAccessToken();
  return useNivoMutation(accountingCommandMutationKey("routine", scope), (trigger: AccountingCommandTrigger<AccountingRoutineInput>) => commandAccountingRoutine(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [accountingRoutineResultQueryKey(scope, { intentId: trigger.input.intentId })], shouldInvalidate: accountingAnswerNeedsRead });
};

/** Answer, defer, reopen, escalate or dismiss one material exception at its exact revision. */
export const useMutateAccountingExceptionSwr = (scope: AccountingInstallationScope) => {
  const accessToken = useAccountingAccessToken();
  return useNivoMutation(accountingCommandMutationKey("exception", scope), (trigger: AccountingCommandTrigger<AccountingExceptionInput>) => commandAccountingException(accessToken, scope, trigger.input, trigger.requestId));
};

/** Propose, append or proof-retry one forward correction and refresh the result lineage it names. */
export const useMutateAccountingCorrectSwr = (scope: AccountingInstallationScope) => {
  const accessToken = useAccountingAccessToken();
  return useNivoMutation(accountingCommandMutationKey("correct", scope), (trigger: AccountingCommandTrigger<AccountingCorrectInput>) => commandAccountingCorrect(accessToken, scope, trigger.input, trigger.requestId), {
    invalidates: (trigger, answer) => {
      const resultId = answer.ok ? answer.data.payload.resultId : trigger.input.action === "propose" ? trigger.input.predecessorResultId : null;
      return resultId === null ? [] : [accountingResultDetailQueryKey(scope, { action: "current", resultId })];
    },
    shouldInvalidate: accountingAnswerNeedsRead
  });
};
