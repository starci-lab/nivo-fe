"use client";

import { readSalesHandoff, type SalesHandoffRequest, type SalesInstallationScope } from "@/modules/api/sales";
import { useSession } from "../../auth/useSession";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes. This is the read a prepared or
 * submitted handoff is reconciled by, and it discloses only the sender's own state - the Accounting
 * intake receipt is Accounting's to disclose.
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

/** Cache identity for one Accounting handoff inside one installation. */
export const salesHandoffQueryKey = (scope: SalesInstallationScope, input: SalesHandoffRequest): NivoQueryKey => ["sales", "handoff", scope.workspaceId, scope.instanceId, scope.installationId, input.handoffId];

/**
 * Read one Accounting handoff's sender-side state.
 *
 * @param enabled - False while the installation scope or the handoff identity is not yet known; a
 *   held read addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesHandoffSwr = (scope: SalesInstallationScope, input: SalesHandoffRequest, enabled = true) => {
  const accessToken = useSalesAccessToken();
  return useNivoQuery(enabled && accessToken !== null ? salesHandoffQueryKey(scope, input) : null, () => readSalesHandoff(accessToken, scope, input, salesReadIdentity("sales.handoff@1", scope.installationId, input.handoffId)));
};