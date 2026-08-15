import { TemplateAppProvisioningPage } from "@/components/pages/TemplateAppProvisioningPage"

/** Dynamic route values for resuming one site deployment. */
type TemplateAppResumeRouteProps = { readonly params: Promise<{ readonly siteId: string }> }

/** Mount the template-app provisioning page for one existing site. */
const TemplateAppResumeRoute = async ({ params }: TemplateAppResumeRouteProps) => {
    const { siteId } = await params
    return <TemplateAppProvisioningPage mode="resume" siteId={siteId} />
}

export default TemplateAppResumeRoute
