import { readWorkspaceCheckoutOffers } from "@/modules/api/workspace-controlplane"
import { useNivoQuery } from "../useNivoQuery"
import { workspaceCheckoutOffersQueryKey } from "./queries.shared"

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
