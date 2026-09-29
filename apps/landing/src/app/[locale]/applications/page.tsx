import { pageMetadata, type LocaleParams } from "@/features/layouts/SiteShell"
import { ProductPage } from "@/features/pages/product"

/** Search and social metadata: the `product.applications.metadata` catalog entries in the language of the request. */
export const generateMetadata = ({ params }: LocaleParams) =>
    pageMetadata({ params, page: "product.applications", path: "/applications" })

/** The `/applications` adapter mounts one business-relevance owner. */
const Page = () => <ProductPage page="applications" />

export default Page
