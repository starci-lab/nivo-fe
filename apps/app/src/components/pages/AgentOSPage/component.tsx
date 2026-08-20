import {
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

/** Compose management before creation because owned workspaces are the stable AgentOS surface. */
export const AgentOSPageBase = (props: AgentOSPageProps) => (
    <Tree
        contract="titled-section-stack-page"
        render={defineContractComponent("titled-section-stack-page", {
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
