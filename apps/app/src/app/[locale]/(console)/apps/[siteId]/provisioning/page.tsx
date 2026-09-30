import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { TemplateAppProvisioningPage } from "@/features/pages/TemplateAppProvisioningPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const metadata = await getTranslations("metadata.appProvisioning")
    const page = await getTranslations("console.apps")
    return {
        title: metadata("title"),
        description: page("provisioningDescription"),
    }
}

/** Dynamic route values for resuming one site deployment. */
type TemplateAppResumeRouteProps = { readonly params: Promise<{ readonly siteId: string }> }

/** Mount the template-app provisioning page for one existing site. */
const Page = async ({ params }: TemplateAppResumeRouteProps) => {
    const { siteId } = await params
    return <TemplateAppProvisioningPage mode="resume" siteId={siteId} />
}

export default Page
