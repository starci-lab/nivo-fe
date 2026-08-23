import { Breadcrumbs, Heading, Text, TileIcon, Tree, defineContractComponent, defineContractProjection, defineLeafComponent } from "@nivo/ui"
import { AgentOSModuleIntake } from "@/components/blocks/agentos/AgentOSModuleIntake"

type AgentOSModuleCreatePageViewProps = { readonly workspaceId: string, readonly labels: { readonly path: string, readonly modules: string, readonly title: string, readonly description: string, readonly eyebrow: string }, readonly onBack: () => void }

/** Compose the pre-persistence intake route with a reliable modules breadcrumb. */
export const AgentOSModuleCreatePageBase = ({ workspaceId, labels, onBack }: AgentOSModuleCreatePageViewProps) => (
    <Tree contract="agentos-route-page" render={defineContractComponent("agentos-route-page", {
        path: defineLeafComponent("breadcrumbs", {}, () => <Breadcrumbs props={{ mode: "back", label: labels.path, backLabel: labels.modules }} on={{ back: onBack }} />),
        heading: defineContractComponent("agentos-page-heading", { identity: defineContractComponent("agentos-page-identity", {
            mark: defineLeafComponent("tile-icon", {}, () => <TileIcon props={{ icon: "agentos" }} />),
            copy: defineContractComponent("agentos-page-title-stack", {
                eyebrow: defineLeafComponent("text", { size: "sm", tone: "accent" }, () => <Text props={{ content: labels.eyebrow, size: "sm", tone: "accent", weight: "semibold" }} />),
                title: defineLeafComponent("heading", { scale: "display" }, () => <Heading props={{ content: labels.title, level: 1, scale: "display" }} />),
                description: defineLeafComponent("text", { size: "md", tone: "muted" }, () => <Text props={{ content: labels.description, size: "md", tone: "muted" }} />),
            }),
        }) }),
        section: [defineContractProjection("label-row-over-card", () => <AgentOSModuleIntake workspaceId={workspaceId} />)],
    })} />
)

/** Source-level tier marker for the pure module create page. */
export const meta = { shape: "page", world: "pure" } as const
