import { nivoOsProductPage } from "./nivoOs"
import { systemOfResponsibilityProductPage } from "./systemOfResponsibility"
import { applicationsProductPage } from "./applications"
import { pricingProductPage } from "./pricing"
import type { ProductPageId, ProductPageStructure } from "./types"

export {
    type BlockStructure,
    type ProductActionRenderer,
    type ProductBlockContext,
    type ProductPageId,
    type ProductPageStructure,
} from "./types"

/** Complete product page catalog keyed by each page's stable id. */
export const PRODUCT_PAGES: Record<ProductPageId, ProductPageStructure> = {
    nivoOs: nivoOsProductPage,
    systemOfResponsibility: systemOfResponsibilityProductPage,
    applications: applicationsProductPage,
    pricing: pricingProductPage,
}
