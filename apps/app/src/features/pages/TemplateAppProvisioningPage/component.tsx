import { Heading, Text } from "@starci/grammar/common"
import { Breadcrumbs } from "@nivo/ui"
import { TemplateAppProvisioning } from "@/components/blocks/provisioning/TemplateAppProvisioning"

/** Route identity needed to create or resume one Template App. */
export type TemplateAppProvisioningRouteProps =
    | {
          readonly mode: "new"
          readonly templateKey: string
      }
    | {
          readonly mode: "resume"
          readonly siteId: string
      }

/** Page-owned copy around the connected provisioning block. */
export type TemplateAppProvisioningPageLabels = {
    readonly path: string
    readonly apps: string
    readonly createTitle: string
    readonly createDescription: string
    readonly provisioningTitle: string
    readonly provisioningDescription: string
}

/** Full resolved content the connected page hands the pure half. */
export type TemplateAppProvisioningPageViewProps = TemplateAppProvisioningRouteProps & {
    readonly labels: TemplateAppProvisioningPageLabels
}

/** Actions the connected page wires into the pure half. */
export type TemplateAppProvisioningPageBaseOn = {
    readonly openApps: () => void
}

/** Props for {@link TemplateAppProvisioningPageBase}: atom data plus action commands. */
export type TemplateAppProvisioningPageProps = {
    readonly props: TemplateAppProvisioningPageViewProps
    readonly on: TemplateAppProvisioningPageBaseOn
}

/** Compose the create or persisted-site lifecycle without proxying block state. */
export const TemplateAppProvisioningPageBase = (props: TemplateAppProvisioningPageProps) => {
    const { props: view, on } = props
    const title = view.mode === "new" ? view.labels.createTitle : view.labels.provisioningTitle
    const description = view.mode === "new" ? view.labels.createDescription : view.labels.provisioningDescription
    return (
        <div>
            <Breadcrumbs
                props={{
                    mode: "trail",
                    label: view.labels.path,
                    steps: [
                        {
                            id: "apps",
                            label: view.labels.apps,
                        },
                        {
                            id: view.mode,
                            label: title,
                            isCurrent: true,
                        },
                    ],
                }}
                on={{
                    activate: (id) => {
                        if (id === "apps") on.openApps()
                    },
                }}
            />
            <div>
                <Heading level={1}>{title}</Heading>

                <Text size="sm" tone="muted">
                    {description}
                </Text>
            </div>
            <>
                <TemplateAppProvisioning
                    context={
                        view.mode === "new"
                            ? {
                                  mode: "new",
                                  templateKey: view.templateKey,
                              }
                            : {
                                  mode: "resume",
                                  siteId: view.siteId,
                              }
                    }
                />
            </>
        </div>
    )
}
