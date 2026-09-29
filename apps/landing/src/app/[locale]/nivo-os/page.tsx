import { pageMetadata, type LocaleParams } from "@/features/layouts/SiteShell"
import { ProductPage } from "@/features/pages/product"

/** Search and social metadata: the `product.nivoOs.metadata` catalog entries in the language of the request. */
export const generateMetadata = ({ params }: LocaleParams) =>
    pageMetadata({ params, page: "product.nivoOs", path: "/nivo-os" })

/** The `/nivo-os` adapter mounts one canonical product page owner. */
const Page = () => <ProductPage page="nivoOs" />

export default Page
