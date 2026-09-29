"use client";

import { readSalesCommand, type SalesCommandRequest, type SalesInstallationScope } from "@/modules/api/sales";
import { operationReadIdentity } from "@/modules/api/operation-route";
import { useAccessToken } from "../../auth/useAccessToken";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes. This is the read a submitted or
 * clarified command plan is reconciled by - by its own command identity, never by a new one.
 */

/** Cache identity for one command plan inside one installation. */
export const salesCommandQueryKey = (scope: SalesInstallationScope, input: SalesCommandRequest): NivoQueryKey => ["sales", "command", scope.workspaceId, scope.instanceId, scope.installationId, input.commandId];

/**
 * Read one command plan's committed state.
 *
 * @param enabled - False while the installation scope or the command identity is not yet known; a
 *   held read addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesCommandSwr = (scope: SalesInstallationScope, input: SalesCommandRequest, enabled = true) => {
  const accessToken = useAccessToken();
  return useNivoQuery(enabled && accessToken !== null ? salesCommandQueryKey(scope, input) : null, () => readSalesCommand(accessToken, scope, input, operationReadIdentity("sales.command@1", scope.installationId, input.commandId)));
};