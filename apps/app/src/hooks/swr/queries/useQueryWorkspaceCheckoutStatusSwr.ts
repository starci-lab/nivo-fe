"use client";

import { readWorkspaceCheckoutStatus } from "@/modules/api/workspace-controlplane";
import { useNivoQuery, type NivoQueryKey } from "../useNivoQuery";

/*
 * One hook per file, one registered read per hook: the file's basename is the hook it exports, which
 * is what the repository's source-name rule requires of a `use*` export. The purchase-identity key is
 * exported so the two command hooks of this seam can refresh exactly the read they moved.
 */

/** Cache identity of one purchase's composed status read. */
export const workspaceCheckoutStatusQueryKey = (purchaseId: string): NivoQueryKey => ["workspace-checkout", "status", purchaseId];

/**
 * Read one owned purchase's composed truth.
 *
 * @param enabled - False until a purchase identity is known; a held read addresses nothing rather
 *   than addressing the empty purchase identity.
 */
export const useQueryWorkspaceCheckoutStatusSwr = (purchaseId: string, enabled = true) =>
  useNivoQuery(enabled ? workspaceCheckoutStatusQueryKey(purchaseId) : null, () => readWorkspaceCheckoutStatus(purchaseId));