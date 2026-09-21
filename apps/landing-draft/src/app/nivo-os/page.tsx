import type { Metadata } from "next"
import { PRODUCT_PAGE_METADATA, ProductPage } from "@/components/pages/product"

/** Search and social metadata owned by the canonical NIVO OS content contract. */
export const metadata: Metadata = PRODUCT_PAGE_METADATA["nivo-os"]

/** The `/nivo-os` adapter mounts one canonical product page owner. */
const NivoOsRoute = () => <ProductPage page="nivo-os" />

export default NivoOsRoute
