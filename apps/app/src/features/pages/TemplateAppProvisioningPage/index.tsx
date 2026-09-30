import { TemplateAppProvisioningPage as TemplateAppProvisioningPageBlock } from "@/components/blocks/provisioning/TemplateAppProvisioning"

/** Route identity needed to create or resume one Template App. */
export type TemplateAppProvisioningPageProps =
    | { readonly mode: "new"; readonly templateKey: string }
    | { readonly mode: "resume"; readonly siteId: string }

/** Compose the interactive Template App provisioning block for its route identity. */
export const TemplateAppProvisioningPage = (props: TemplateAppProvisioningPageProps) => (
    <TemplateAppProvisioningPageBlock {...props} />
)

export default TemplateAppProvisioningPage