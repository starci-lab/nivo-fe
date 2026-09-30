"use client"

import { readWorkspaceCheckoutOffers } from "@/modules/api/workspace-controlplane"
import { useNivoQuery } from "../useNivoQuery"
import { type NivoQueryKey } from "../swr.shared"

/*
 * One hook per file, one registered read per hook: the file's basename is the hook it exports, which
 * is what the repository's source-name rule requires of a `use*` export. The offer-identity key is a
 * function rather than a module constant so it stays out of the frozen-value shape the same rule checks.
 */

/** Cache identity of one offer selection: the exact offer identity and version the screen presents. */
export const workspaceCheckoutOffersQueryKey = (offerId: string, offerVersion: string): NivoQueryKey => [
    "workspace-checkout",
    "offers",
    offerId,
    offerVersion,
]

/**
 * Select one exact offer version and read the currently approved offers.
 *
 * @param enabled - False until the screen holds an offer to present; a held read addresses nothing
 *   rather than addressing a half-filled offer identity.
 */
export const useQueryWorkspaceCheckoutOffersSwr = (offerId: string, offerVersion: string, enabled = true) =>
    useNivoQuery(enabled ? workspaceCheckoutOffersQueryKey(offerId, offerVersion) : null, () =>
        readWorkspaceCheckoutOffers(offerId, offerVersion),
    )
