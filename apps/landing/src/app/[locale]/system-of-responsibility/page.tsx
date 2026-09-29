import { pageMetadata, type LocaleParams } from "@/features/layouts/SiteShell"
import { ProductPage } from "@/features/pages/product"

/** Search and social metadata: the `product.systemOfResponsibility.metadata` catalog entries in the language of the request. */
export const generateMetadata = ({ params }: LocaleParams) => pageMetadata({ params, page: "product.systemOfResponsibility", path: "/system-of-responsibility" })

/** The conceptual route mounts one canonical page owner. */
const Page = () => <ProductPage page="systemOfResponsibility" />

export default Page
