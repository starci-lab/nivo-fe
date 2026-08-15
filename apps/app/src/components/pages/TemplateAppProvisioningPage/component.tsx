import {
    Heading,
    Tree,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"
import { TemplateAppProvisioning } from "@/components/blocks/provisioning/TemplateAppProvisioning"

/** The route identity needed to start or resume a template-app deployment. */
export type TemplateAppProvisioningPageProps =
    | { readonly mode: "new"; readonly templateKey: string }
    | { readonly mode: "resume"; readonly siteId: string }

/** Compose the template-app domain block on its own route-level screen. */
export const _TemplateAppProvisioningPage = (props: TemplateAppProvisioningPageProps) => (
    <Tree
        contract="titled-section-stack-page"
        render={defineContractComponent("titled-section-stack-page", {
            heading: defineContractComponent("title-with-end-action", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: "Template App", level: 1 }} />
                )),
            }),
            section: [defineContractProjection("label-row-over-card", () => (
                <TemplateAppProvisioning context={props} />
            ))],
        })}
    />
)

/** Source-level tier marker for the pure page half. */
export const meta = { shape: "page", world: "pure" } as const
