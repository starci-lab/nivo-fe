"use client";

import { readSalesPipeline, type SalesInstallationScope, type SalesPipelineRequest } from "@/modules/api/sales";
import { useSession } from "@/modules/auth/session";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/*
 * One hook per file, one registered read per hook: this file names exactly one Sales operation, its
 * cache identity and the stable read identity the route echoes.
 *
 * THE TOKEN READER, THE STATUS VOCABULARY AND THE READ IDENTITY ARE PRIVATE HERE. `checkSourceNames`
 * exempts only a file whose basename is the hook it exports, so a shared non-hook helper path would
 * itself be a naming finding, and no such path is in this slice's grant: each file carries its own
 * copy.
 */

/** The signed-in access token, or null when no session holds one. */
const useSalesAccessToken = () => {
  const session = useSession();
  return session.state.status === "signed-in" ? session.state.accessToken : null;
};

/** The stable identity one Sales read is addressed by: its registered name and its own selector. */
const salesReadIdentity = (operation: string, ...parts: ReadonlyArray<string | null>): string => `${operation}/${parts.map(part => part ?? "-").join("/")}`;

/** The pipeline's own status vocabulary, in the one order that canonicalises a status filter. */
const SALES_STATUS_ORDER: ReadonlyArray<"open" | "won" | "lost"> = ["open", "won", "lost"];

/**
 * The one segment a status filter contributes.
 *
 * The three statuses are a closed vocabulary, so a selection is canonicalised into the vocabulary's
 * own order: two spellings of one selection are one cache entry, and only a status the vocabulary
 * declares can be selected at all.
 */
const salesStatusFilterSegment = (statusFilter: SalesPipelineRequest["statusFilter"]): string =>
  statusFilter === null || statusFilter.length === 0
    ? "all-statuses"
    : SALES_STATUS_ORDER.filter(status => statusFilter.includes(status)).join("+");

/** Cache identity for one pipeline page inside one installation. */
export const salesPipelineQueryKey = (scope: SalesInstallationScope, input: SalesPipelineRequest): NivoQueryKey => ["sales", "pipeline", scope.workspaceId, scope.instanceId, scope.installationId, input.scopeFingerprint, salesStatusFilterSegment(input.statusFilter), input.after?.lastOpportunityId ?? "first-page", input.limit];

/**
 * Read one bounded live page of the current pipeline.
 *
 * @param enabled - False while the installation scope or the page selector is not yet known; a held
 *   read addresses nothing rather than addressing a half-filled operation path.
 */
export const useQuerySalesPipelineSwr = (scope: SalesInstallationScope, input: SalesPipelineRequest, enabled = true) => {
  const accessToken = useSalesAccessToken();
  return useNivoQuery(enabled && accessToken !== null ? salesPipelineQueryKey(scope, input) : null, () => readSalesPipeline(accessToken, scope, input, salesReadIdentity("sales.pipeline@1", scope.installationId, input.scopeFingerprint, input.after?.lastOpportunityId ?? null)));
};