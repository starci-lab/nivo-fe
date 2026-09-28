"use client";

import { readSalesReadiness, type SalesInstallationScope, type SalesReadinessRequest } from "@/modules/api/sales";
import { useSession } from "../../auth/useSession";
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

/** Cache identity for one installation's observed readiness. */
export const salesReadinessQueryKey = (scope: SalesInstallationScope, input: SalesReadinessRequest): NivoQueryKey => ["sales", "readiness", scope.workspaceId, scope.instanceId, scope.installationId, input.salesInstallationId];

/**
 * Read one installation's observed readiness.
 *
 * @param enabled - False while the installation scope is not yet known; a held read addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesReadinessSwr = (scope: SalesInstallationScope, input: SalesReadinessRequest, enabled = true) => {
  const accessToken = useSalesAccessToken();
  return useNivoQuery(enabled && accessToken !== null ? salesReadinessQueryKey(scope, input) : null, () => readSalesReadiness(accessToken, scope, input, salesReadIdentity("sales.readiness@1", scope.installationId, input.salesInstallationId)));
};