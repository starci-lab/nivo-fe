import { TemplateAppProvisioningPage } from "@/components/pages/TemplateAppProvisioningPage"

/** Dynamic route values for starting one catalogue template. */
type TemplateAppCreateRouteProps = { readonly params: Promise<{ readonly templateKey: string }> }

/** Mount the template-app provisioning page in new-request mode. */
const TemplateAppCreateRoute = async ({ params }: TemplateAppCreateRouteProps) => {
    const { templateKey } = await params
    return <TemplateAppProvisioningPage mode="new" templateKey={templateKey} />
}

export default TemplateAppCreateRoute
