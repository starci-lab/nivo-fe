"use client"
import { catalogItems, type CatalogCategory } from "@/modules/api/commerce"
import { useNivoQuery } from "../useNivoQuery"
import { QUERY_CATALOG_ITEMS_SWR_KEY } from "../swr.shared"

/** Read one public catalog category behind a viewer-scoped cache key. */
export const useQueryCatalogItemsSwr = (category: CatalogCategory, enabled = true) =>
    useNivoQuery(enabled ? QUERY_CATALOG_ITEMS_SWR_KEY(category) : null, () => catalogItems(category))
