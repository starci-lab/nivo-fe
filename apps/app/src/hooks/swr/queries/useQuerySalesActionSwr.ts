"use client";

import { readSalesAction, type SalesActionRequest, type SalesInstallationScope } from "@/modules/api/sales";
import { operationReadIdentity } from "@/modules/api/operation-route";
import { useAccessToken } from "../../auth/useAccessToken";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes. This is the read every recovery
 * attempt is reconciled by, and the read that discloses the no-start proof state a retry needs.
 */

/** Cache identity for one Sales action inside one installation. */
export const salesActionQueryKey = (scope: SalesInstallationScope, input: SalesActionRequest): NivoQueryKey => ["sales", "action", scope.workspaceId, scope.instanceId, scope.installationId, input.actionId];

/**
 * Read one Sales action's stored state.
 *
 * @param enabled - False while the installation scope or the action identity is not yet known; a
 *   held read addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesActionSwr = (scope: SalesInstallationScope, input: SalesActionRequest, enabled = true) => {
  const accessToken = useAccessToken();
  return useNivoQuery(enabled && accessToken !== null ? salesActionQueryKey(scope, input) : null, () => readSalesAction(accessToken, scope, input, operationReadIdentity("sales.action@1", scope.installationId, input.actionId)));
};