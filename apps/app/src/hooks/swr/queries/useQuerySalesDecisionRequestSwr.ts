"use client";

import { readSalesDecisionRequest, type SalesDecisionRequestRequest, type SalesInstallationScope } from "@/modules/api/sales";
import { useSession } from "@/modules/auth/session";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes. This is the read a decision answer
 * is reconciled by, so an answered proposal is settled from its own committed state.
 *
 * THE TOKEN READER AND THE READ IDENTITY ARE PRIVATE HERE. `checkSourceNames` exempts only a file
 * whose basename is the hook it exports, so a shared non-hook helper path would itself be a naming
 * finding, and no such path is in this slice's grant: each file carries its own copy.
 */

/** The signed-in access token, or null when no session holds one. */
const useSalesAccessToken = () => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};

/** The stable identity one Sales read is addressed by: its registered name and its own selector. */
const salesReadIdentity = (operation: string, ...parts: ReadonlyArray<string | null>): string => `${operation}/${parts.map(part => part ?? "-").join("/")}`;

/** Cache identity for one decision request inside one installation. */
export const salesDecisionRequestQueryKey = (scope: SalesInstallationScope, input: SalesDecisionRequestRequest): NivoQueryKey => ["sales", "decision-request", scope.workspaceId, scope.instanceId, scope.installationId, input.decisionRequestId];

/**
 * Read one decision request's committed state.
 *
 * @param enabled - False while the installation scope or the decision identity is not yet known; a
 *   held read addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesDecisionRequestSwr = (scope: SalesInstallationScope, input: SalesDecisionRequestRequest, enabled = true) => {
  const accessToken = useSalesAccessToken();
  return useNivoQuery(enabled && accessToken !== null ? salesDecisionRequestQueryKey(scope, input) : null, () => readSalesDecisionRequest(accessToken, scope, input, salesReadIdentity("sales.decisionRequest@1", scope.installationId, input.decisionRequestId)));
};