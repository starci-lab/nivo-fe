import type { Metadata } from "next"
import { pageMetadata, type LocaleParams } from "@/features/layouts/SiteShell"
import { TrustPage } from "@/features/pages/explore"

/** Search and sharing metadata for the canonical Trust route, in the routed language. */
export const generateMetadata = ({ params }: LocaleParams): Promise<Metadata> =>
    pageMetadata({ params, page: "explore.trust", path: "/trust" })

/** The `/trust` framework adapter. */
const Page = () => <TrustPage />

export default Page
