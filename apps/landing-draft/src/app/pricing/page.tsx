import type { Metadata } from "next"
import { PRODUCT_PAGE_METADATA, ProductPage } from "@/components/pages/product"
import styles from "../commercial-corporate.module.css"

/** Search and social metadata owned by the commercial-decision content contract. */
export const metadata: Metadata = PRODUCT_PAGE_METADATA.pricing

/** The `/pricing` adapter mounts one commercial-decision owner. */
const PricingRoute = () => (
    <div className={`${styles.routeFrame} ${styles.pricingRoute}`}>
        <ProductPage page="pricing" />
    </div>
)

export default PricingRoute
