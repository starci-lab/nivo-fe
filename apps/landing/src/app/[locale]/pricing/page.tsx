import { pageMetadata, type LocaleParams } from "@/features/layouts/SiteShell"
import { PricingPage } from "@/features/pages/PricingPage"

/** Search and social metadata: the `product.pricing.metadata` catalog entries in the language of the request. */
export const generateMetadata = ({ params }: LocaleParams) => pageMetadata({ params, page: "product.pricing", path: "/pricing" })

/** The `/pricing` adapter mounts one commercial-decision owner. */
const Page = () => <PricingPage />

export default Page
