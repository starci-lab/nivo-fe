import type { Metadata } from "next"
import { pageMetadata, type LocaleParams } from "@/features/layouts/SiteShell"
import { EcosystemPage } from "@/features/pages/explore"

/** Search and sharing metadata for the canonical Ecosystem route, in the routed language. */
export const generateMetadata = ({ params }: LocaleParams): Promise<Metadata> => pageMetadata({ params, page: "explore.ecosystem", path: "/ecosystem" })

/** The `/ecosystem` framework adapter. */
const Page = () => <EcosystemPage />

export default Page
