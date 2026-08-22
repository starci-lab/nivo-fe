import {
    Breadcrumbs,
    Heading,
    Tree,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"
import { AgentOSWorkspaceList } from "@/components/blocks/agentos/AgentOSWorkspaceList"
import { AgentOSProvisioning } from "@/components/blocks/provisioning/AgentOSProvisioning"

/** The route identity needed to start or resume an AgentOS order. */
export type AgentOSPageProps =
    | { readonly mode: "new" }
    | { readonly mode: "resume"; readonly orderId: string }

/** Resolved path copy and navigation owned by the connected page half. */
export type AgentOSPageViewProps = AgentOSPageProps & {
    readonly path: {
        readonly label: string
        readonly overviewLabel: string
        readonly currentLabel: string
    }
    readonly onOpenOverview?: () => void
}

/** Compose management before creation because owned workspaces are the stable AgentOS surface. */
export const AgentOSPageBase = (props: AgentOSPageViewProps) => (
    <Tree
        contract="titled-section-stack-page"
        render={defineContractComponent("titled-section-stack-page", {
            path: defineLeafComponent("breadcrumbs", {}, () => (
                <Breadcrumbs
                    props={{
                        mode: "trail",
                        label: props.path.label,
                        steps: [
                            { id: "overview", label: props.path.overviewLabel },
                            { id: "agentos", label: props.path.currentLabel, isCurrent: true },
                        ],
                    }}
                    on={{ activate: (id) => { if (id === "overview") props.onOpenOverview?.() } }}
                />
            )),
            heading: defineContractComponent("title-with-end-action", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: "AgentOS", level: 1 }} />
                )),
            }),
            section: props.mode === "new"
                ? [
                    defineContractProjection("label-row-over-card", () => <AgentOSWorkspaceList />),
                    defineContractProjection("label-row-over-card", () => <AgentOSProvisioning context={props} />),
                ]
                : [defineContractProjection("label-row-over-card", () => <AgentOSProvisioning context={props} />)],
        })}
    />
)

/** Source-level tier marker for the pure page half. */
export const meta = { shape: "page", world: "pure" } as const
