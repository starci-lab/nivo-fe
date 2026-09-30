import type { Outcome } from "@nivo/api"
import { catalogItems } from "../commerce"
import type { CatalogCategory, CatalogItemsQuery } from "../__generated__/core"

/**
 * List the workspace offers a purchaser may select (contract operation `select-offer`).
 *
 * @param category - Which catalogue slice publishes the workspace offers.
 * @returns The offers, or why there are none.
 */
export const listWorkspacePurchaseOffers = (
    category: CatalogCategory,
): Promise<Outcome<ReadonlyArray<NonNullable<CatalogItemsQuery["catalogItems"]["data"]>[number]>>> =>
    catalogItems(category)
