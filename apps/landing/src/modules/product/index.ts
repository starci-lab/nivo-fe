import { nivoOsProductPage } from "./nivoOs"
import { systemOfResponsibilityProductPage } from "./systemOfResponsibility"
import { applicationsProductPage } from "./applications"
import { pricingProductPage } from "./pricing"
import type { ProductPageId, ProductPageStructure } from "./types"

export {
    type ActionStructure,
    type BlockStructure,
    type CardStructure,
    type OfferStructure,
    type PathStructure,
    type ProductActionRenderer,
    type ProductBlockContext,
    type ProductHref,
    type ProductPageId,
    type ProductPageStructure,
    type ProductTranslate,
    type SectionStructure,
} from "./types"
export { nivoOsProductPage } from "./nivoOs"
export { systemOfResponsibilityProductPage } from "./systemOfResponsibility"
export { applicationsProductPage } from "./applications"
export { pricingProductPage } from "./pricing"

/** Complete product page catalog keyed by each page's stable id. */
export const PRODUCT_PAGES: Record<ProductPageId, ProductPageStructure> = {
    nivoOs: nivoOsProductPage,
    systemOfResponsibility: systemOfResponsibilityProductPage,
    applications: applicationsProductPage,
    pricing: pricingProductPage,
}
