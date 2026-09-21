import type { Metadata } from "next"
import { PRODUCT_PAGE_METADATA, ProductPage } from "@/components/pages/product"

/** Search and social metadata owned by the business-applications content contract. */
export const metadata: Metadata = PRODUCT_PAGE_METADATA.applications

/** The `/applications` adapter mounts one business-relevance owner. */
const ApplicationsRoute = () => <ProductPage page="applications" />

export default ApplicationsRoute
