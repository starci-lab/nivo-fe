import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

/** Resolve not-found metadata in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.notFound")
    return { title: t("title"), description: t("description") }
}

/** Answer an unmatched locale address with the segment's not-found route. */
const Page = () => notFound()

export default Page
