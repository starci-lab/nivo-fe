"use client";

import { resolveWorkspaceCheckoutEntry, type WorkspaceCheckoutEntryRequest } from "@/modules/api/workspace-controlplane";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/*
 * One hook per file, one registered read per hook: the file's basename is the hook it exports, which
 * is what the repository's source-name rule requires of a `use*` export. The entry key carries the
 * three identities the entry contract compares, so a read of one workspace never answers another's.
 */

/** Cache identity of one entry resolution: the purchase, workspace and readiness observation claimed. */
export const workspaceCheckoutEntryQueryKey = (request: WorkspaceCheckoutEntryRequest): NivoQueryKey => ["workspace-checkout", "entry", request.purchaseId, request.workspaceId, request.readinessObservationId];

/**
 * Resolve the registered entry destination for one readiness-confirmed workspace.
 *
 * @param enabled - False while readiness is unconfirmed; a held read addresses nothing rather than
 *   addressing an identity the caller has not claimed.
 */
export const useQueryWorkspaceCheckoutEntrySwr = (request: WorkspaceCheckoutEntryRequest, enabled = true) =>
  useNivoQuery(enabled ? workspaceCheckoutEntryQueryKey(request) : null, () => resolveWorkspaceCheckoutEntry(request));