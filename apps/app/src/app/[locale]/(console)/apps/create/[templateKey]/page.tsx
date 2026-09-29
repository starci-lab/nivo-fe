import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { TemplateAppProvisioningPage } from "@/features/pages/TemplateAppProvisioningPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.appCreate")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/** Dynamic route values for starting one catalogue template. */
type TemplateAppCreateRouteProps = { readonly params: Promise<{ readonly templateKey: string }> }

/** Mount the template-app provisioning page in new-request mode. */
const Page = async ({ params }: TemplateAppCreateRouteProps) => {
    const { templateKey } = await params
    return <TemplateAppProvisioningPage mode="new" templateKey={templateKey} />
}

export default Page
