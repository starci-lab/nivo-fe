import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { OverviewPage } from "@/features/pages/OverviewPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const metadata = await getTranslations("metadata.overview")
    const page = await getTranslations("console")
    return {
        title: metadata("title"),
        description: page("overview.lede"),
    }
}

/**
 * The `/overview` route. It mounts one page and makes no drawing decision - LAYOUT-6.
 *
 * @returns The route.
 */
const Page = () => <OverviewPage />

export default Page
