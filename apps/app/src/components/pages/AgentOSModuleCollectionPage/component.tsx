import { Breadcrumbs, Button, Heading, Text, TileIcon, Tree, defineContractComponent, defineContractProjection, defineLeafComponent } from "@nivo/ui"
import { AgentOSCustomModuleCollection } from "@/components/blocks/agentos/AgentOSCustomModuleCollection"
import { AgentOSSolutionModuleCenter } from "@/components/blocks/agentos/AgentOSSolutionModuleCenter"

type AgentOSModuleCollectionPageViewProps = { readonly workspaceId: string, readonly labels: { readonly path: string, readonly workspace: string, readonly title: string, readonly description: string, readonly eyebrow: string, readonly create: string }, readonly onBack: () => void, readonly onCreate: () => void }

/** Compose custom management and the immutable solution catalogue under one route identity. */
export const AgentOSModuleCollectionPageBase = ({ workspaceId, labels, onBack, onCreate }: AgentOSModuleCollectionPageViewProps) => (
    <Tree contract="agentos-route-page" render={defineContractComponent("agentos-route-page", {
        path: defineLeafComponent("breadcrumbs", {}, () => <Breadcrumbs props={{ mode: "trail", label: labels.path, steps: [{ id: "workspace", label: labels.workspace }, { id: "modules", label: labels.title, isCurrent: true }] }} on={{ activate: onBack }} />),
        heading: defineContractComponent("agentos-page-heading", {
            identity: defineContractComponent("agentos-page-identity", {
                mark: defineLeafComponent("tile-icon", {}, () => <TileIcon props={{ icon: "agentos", signal: "active" }} />),
                copy: defineContractComponent("agentos-page-title-stack", {
                    eyebrow: defineLeafComponent("text", { size: "sm", tone: "accent" }, () => <Text props={{ content: labels.eyebrow, size: "sm", tone: "accent", weight: "semibold" }} />),
                    title: defineLeafComponent("heading", { scale: "display" }, () => <Heading props={{ content: labels.title, level: 1, scale: "display" }} />),
                    description: defineLeafComponent("text", { size: "md", tone: "muted" }, () => <Text props={{ content: labels.description, size: "md", tone: "muted" }} />),
                }),
            }),
            action: defineLeafComponent("button", { size: "lg" }, () => <Button props={{ label: labels.create, size: "lg", variant: "primary" }} on={{ press: onCreate }} />),
        }),
        section: [defineContractProjection("label-row-over-card", () => <AgentOSCustomModuleCollection workspaceId={workspaceId} />), defineContractProjection("label-row-over-card", () => <AgentOSSolutionModuleCenter workspaceId={workspaceId} />)],
    })} />
)

/** Source-level tier marker for the pure module collection page. */
export const meta = { shape: "page", world: "pure" } as const
