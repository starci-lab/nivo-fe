import { TemplateAppProvisioningPage } from "@/components/pages/TemplateAppProvisioningPage"

/** Dynamic route values for starting one catalogue template. */
type TemplateAppNewRouteProps = { readonly params: Promise<{ readonly templateKey: string }> }

/** Mount the template-app provisioning page in new-request mode. */
const TemplateAppNewRoute = async ({ params }: TemplateAppNewRouteProps) => {
    const { templateKey } = await params
    return <TemplateAppProvisioningPage mode="new" templateKey={templateKey} />
}

export default TemplateAppNewRoute
