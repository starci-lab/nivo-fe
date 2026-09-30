import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AcademyControlCenterPage } from "@/features/pages/AcademyControlCenterPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.appSite")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Dynamic identity supplied by the locale-aware Academy route. */
type AcademyControlCenterRouteProps = { readonly params: Promise<{ readonly siteId: string }> }

/** Mount one exact owner-scoped Academy control center. */
const Page = async ({ params }: AcademyControlCenterRouteProps) => {
    const { siteId } = await params
    return <AcademyControlCenterPage siteId={siteId} />
}

export default Page
