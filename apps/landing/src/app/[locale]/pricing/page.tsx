import type { Metadata } from "next"
import { PRODUCT_PAGE_METADATA } from "@/features/pages/product"
import { PricingPage } from "@/features/pages/PricingPage"

/** Search and social metadata owned by the commercial-decision content contract. */
export const metadata: Metadata = PRODUCT_PAGE_METADATA.pricing

/** The `/pricing` adapter mounts one commercial-decision owner. */
const Page = () => <PricingPage />

export default Page