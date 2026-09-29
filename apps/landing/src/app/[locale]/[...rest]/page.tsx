import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.notFound")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** The unmatched address under a locale: it answers 404 so the locale's own not-found page draws it. */
const Page = () => notFound()

export default Page
