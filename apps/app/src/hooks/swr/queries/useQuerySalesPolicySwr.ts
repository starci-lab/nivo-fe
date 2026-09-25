"use client";

import { readSalesPolicy, type SalesInstallationScope, type SalesPolicyRequest } from "@/modules/api/sales";
import { useSession } from "@/modules/auth/session";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes.
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

/** Cache identity for one installation's policy revision, current or the one a configure request stored. */
export const salesPolicyQueryKey = (scope: SalesInstallationScope, input: SalesPolicyRequest): NivoQueryKey => ["sales", "policy", scope.workspaceId, scope.instanceId, scope.installationId, input.requestId ?? "current-revision"];

/**
 * Read one installation's operating policy, or the revision one configure request stored.
 *
 * @param enabled - False while the installation scope or the selector is not yet known; a held read
 *   addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesPolicySwr = (scope: SalesInstallationScope, input: SalesPolicyRequest, enabled = true) => {
  const accessToken = useSalesAccessToken();
  return useNivoQuery(enabled && accessToken !== null ? salesPolicyQueryKey(scope, input) : null, () => readSalesPolicy(accessToken, scope, input, salesReadIdentity("sales.policy@1", scope.installationId, input.requestId)));
};