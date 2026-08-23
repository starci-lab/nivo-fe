import {
    Breadcrumbs,
    Heading,
    Text,
    Tree,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"
import { TemplateAppProvisioning } from "@/components/blocks/provisioning/TemplateAppProvisioning"

/** Route identity needed to create or resume one Template App. */
export type TemplateAppProvisioningPageProps =
    | { readonly mode: "new"; readonly templateKey: string }
    | { readonly mode: "resume"; readonly siteId: string }

/** Page-owned copy and navigation around the connected provisioning block. */
export type TemplateAppProvisioningPageViewProps = TemplateAppProvisioningPageProps & {
    readonly labels: {
        readonly path: string
        readonly apps: string
        readonly createTitle: string
        readonly createDescription: string
        readonly provisioningTitle: string
        readonly provisioningDescription: string
    }
    readonly onOpenApps: () => void
}

/** Compose the create or persisted-site lifecycle without proxying block state. */
export const TemplateAppProvisioningPageBase = (view: TemplateAppProvisioningPageViewProps) => {
    const title = view.mode === "new" ? view.labels.createTitle : view.labels.provisioningTitle
    const description = view.mode === "new" ? view.labels.createDescription : view.labels.provisioningDescription
    return (
        <Tree
            contract="titled-section-stack-page"
            render={defineContractComponent("titled-section-stack-page", {
                path: defineLeafComponent("breadcrumbs", {}, () => (
                    <Breadcrumbs
                        props={{
                            mode: "trail",
                            label: view.labels.path,
                            steps: [
                                { id: "apps", label: view.labels.apps },
                                { id: view.mode, label: title, isCurrent: true },
                            ],
                        }}
                        on={{ activate: (id) => { if (id === "apps") view.onOpenApps() } }}
                    />
                )),
                heading: defineContractComponent("title-over-description", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: title, level: 1 }} />
                    )),
                    description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text props={{ content: description, size: "sm", tone: "muted" }} />
                    )),
                }),
                section: [defineContractProjection("label-row-over-card", () => (
                    <TemplateAppProvisioning
                        context={view.mode === "new"
                            ? { mode: "new", templateKey: view.templateKey }
                            : { mode: "resume", siteId: view.siteId }}
                    />
                ))],
            })}
        />
    )
}

/** Source-level tier marker for the pure page compositor. */
export const meta = { shape: "page", world: "pure" } as const
