"use client";

import { readSalesReadiness, type SalesInstallationScope, type SalesReadinessRequest } from "@/modules/api/sales";
import { operationReadIdentity } from "@/modules/api/operation-route";
import { useAccessToken } from "../../auth/useAccessToken";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes.
 */

/** Cache identity for one installation's observed readiness. */
export const salesReadinessQueryKey = (scope: SalesInstallationScope, input: SalesReadinessRequest): NivoQueryKey => ["sales", "readiness", scope.workspaceId, scope.instanceId, scope.installationId, input.salesInstallationId];

/**
 * Read one installation's observed readiness.
 *
 * @param enabled - False while the installation scope is not yet known; a held read addresses
 *   nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesReadinessSwr = (scope: SalesInstallationScope, input: SalesReadinessRequest, enabled = true) => {
  const accessToken = useAccessToken();
  return useNivoQuery(enabled && accessToken !== null ? salesReadinessQueryKey(scope, input) : null, () => readSalesReadiness(accessToken, scope, input, operationReadIdentity("sales.readiness@1", scope.installationId, input.salesInstallationId)));
};