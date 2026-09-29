import { ProductPage } from "@/features/pages/product"
import { CLASS_NAMES } from "./classNames"

/**
 * The canonical `/pricing` page: the commercial-decision frame.
 *
 * IT OWNS THE FRAME, NOT THE PRODUCT SECTIONS. The pricing screen is the product page drawn inside
 * the commercial frame, and that frame is this unit's whole contribution - so the route mounts one
 * component and stops choosing the shape of what a reader sees.
 *
 * @returns The page.
 */
export const PricingPage = () => (
    <div className={CLASS_NAMES.page}>
        <ProductPage page="pricing" />
    </div>
)

export default PricingPage
