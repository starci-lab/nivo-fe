import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AppsPage } from "@/features/pages/AppsPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const metadata = await getTranslations("metadata.apps")
    const page = await getTranslations("console.apps")
    return {
        title: metadata("title"),
        description: page("lede"),
    }
}

/**
 * The `/apps` route. It mounts one page and makes no drawing decision - LAYOUT-6.
 *
 * @returns The route.
 */
const Page = () => <AppsPage />

export default Page
