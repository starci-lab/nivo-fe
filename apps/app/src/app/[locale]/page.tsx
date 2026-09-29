import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { HomePage } from "@/features/pages/HomePage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.home")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/**
 * The `/` route. It mounts the page and nothing else.
 *
 * @returns The route.
 */
const Page = () => <HomePage />

export default Page
