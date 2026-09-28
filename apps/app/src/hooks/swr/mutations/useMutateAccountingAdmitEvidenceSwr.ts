"use client";

import { commandAccountingAdmitEvidence, type AccountingAdmitEvidenceInput, type AccountingInstallationScope, type AccountingOperationAnswer, type AccountingResult } from "@/modules/api/accounting";
import { useSession } from "../../auth/useSession";
import { useNivoMutation, type NivoMutationKey } from "../useNivoMutation";
import { accountingEvidenceQueryKey } from "../queries/useQueryAccountingEvidenceSwr";

/* One hook per file: the token reader, the press-local identity and the answer test are private here. */

const useAccountingAccessToken = () => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};

/** One press of an Accounting command: the receiver's own input plus the stable identity it replays under. */
export type AccountingCommandTrigger<TInput> = { readonly requestId: string; readonly input: TInput };

const accountingCommandMutationKey = (name: string, scope: AccountingInstallationScope): NivoMutationKey => ["accounting", name, scope.workspaceId, scope.instanceId, scope.installationId];

/** Whether an answer still owes a read: a served result confirms it, and an unknown outcome only a read resolves. */
const accountingAnswerNeedsRead = (answer: AccountingOperationAnswer<AccountingResult>): boolean => answer.ok || answer.code === "outcome_unknown";

/** Admit one evidence item and refresh the evidence identity it names. */
export const useMutateAccountingAdmitEvidenceSwr = (scope: AccountingInstallationScope, enabled = true) => {
  const accessToken = useAccountingAccessToken();
  return useNivoMutation(enabled ? accountingCommandMutationKey("admit-evidence", scope) : null, (trigger: AccountingCommandTrigger<AccountingAdmitEvidenceInput>) => commandAccountingAdmitEvidence(accessToken, scope, trigger.input, trigger.requestId), { invalidates: trigger => [accountingEvidenceQueryKey(scope, { evidenceId: trigger.input.evidenceId })], shouldInvalidate: accountingAnswerNeedsRead });
};