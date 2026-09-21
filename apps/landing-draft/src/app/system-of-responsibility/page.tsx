import type { Metadata } from "next"
import { PRODUCT_PAGE_METADATA, ProductPage } from "@/components/pages/product"

/** Search and social metadata owned by the responsibility-system content contract. */
export const metadata: Metadata = PRODUCT_PAGE_METADATA["system-of-responsibility"]

/** The conceptual route mounts one canonical page owner. */
const SystemOfResponsibilityRoute = () => <ProductPage page="system-of-responsibility" />

export default SystemOfResponsibilityRoute
