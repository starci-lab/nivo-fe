import {
    Breadcrumbs,
    Button,
    TileIcon,
    Heading,
    Text,
    Tree,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@nivo/ui"
import { AgentOSWorkspaceList } from "@/components/blocks/agentos/AgentOSWorkspaceList"
import { AgentOSProvisioning } from "@/components/blocks/provisioning/AgentOSProvisioning"

/** Route identity for the dashboard, pre-persistence create flow, or persisted order. */
export type AgentOSPageProps =
    | { readonly mode: "dashboard" }
    | { readonly mode: "create" }
    | { readonly mode: "resume"; readonly orderId: string }

/** Page-owned copy and navigation; connected blocks keep their own request states. */
export type AgentOSPageViewProps = AgentOSPageProps & {
    readonly labels: {
        readonly path: string
        readonly agentos: string
        readonly dashboardDescription: string
        readonly createTitle: string
        readonly createDescription: string
        readonly orderTitle: string
        readonly orderDescription: string
        readonly createAction: string
        readonly dashboardEyebrow?: string
        readonly createEyebrow?: string
        readonly orderEyebrow?: string
    }
    readonly onOpenDashboard: () => void
    readonly onCreate: () => void
}

/** Compose dashboard, create, and order routes without proxying child request data. */
export const AgentOSPageBase = (view: AgentOSPageViewProps) => {
    const isDashboard = view.mode === "dashboard"
    const title = view.mode === "create"
        ? view.labels.createTitle
        : view.mode === "resume"
            ? view.labels.orderTitle
            : view.labels.agentos
    const description = view.mode === "create"
        ? view.labels.createDescription
        : view.mode === "resume"
            ? view.labels.orderDescription
            : view.labels.dashboardDescription
    const eyebrow = view.mode === "create"
        ? view.labels.createEyebrow ?? view.labels.agentos
        : view.mode === "resume"
            ? view.labels.orderEyebrow ?? view.labels.agentos
            : view.labels.dashboardEyebrow ?? view.labels.agentos
    const path = isDashboard ? undefined : defineLeafComponent("breadcrumbs", {}, () => (
        <Breadcrumbs
            props={{
                mode: "trail",
                label: view.labels.path,
                steps: [
                    { id: "agentos", label: view.labels.agentos },
                    { id: view.mode, label: title, isCurrent: true },
                ],
            }}
            on={{ activate: (id) => { if (id === "agentos") view.onOpenDashboard() } }}
        />
    ))
    const heading = defineContractComponent("agentos-page-heading", {
        identity: defineContractComponent("agentos-page-identity", {
            mark: defineLeafComponent("tile-icon", {}, () => (
                <TileIcon props={{ icon: "agentos", signal: isDashboard ? "active" : "none" }} />
            )),
            copy: defineContractComponent("agentos-page-title-stack", {
                eyebrow: defineLeafComponent("text", { size: "sm", tone: "accent" }, () => (
                    <Text props={{ content: eyebrow, size: "sm", tone: "accent", weight: "semibold" }} />
                )),
                title: defineLeafComponent("heading", { scale: "display" }, () => (
                    <Heading props={{ content: title, level: 1, scale: "display" }} />
                )),
                description: defineLeafComponent("text", { size: "md", tone: "muted" }, () => (
                    <Text props={{ content: description, size: "md", tone: "muted" }} />
                )),
            }),
        }),
        ...(isDashboard ? {
            action: defineLeafComponent("button", { size: "lg" }, () => (
                <Button props={{ label: view.labels.createAction, variant: "primary", size: "lg" }} on={{ press: view.onCreate }} />
            )),
        } : {}),
    })
    const section = isDashboard
        ? [defineContractProjection("agentos-dashboard-body", () => <AgentOSWorkspaceList />)]
        : [defineContractProjection("label-row-over-card", () => (
            <AgentOSProvisioning context={view.mode === "create" ? { mode: "new" } : { mode: "resume", orderId: view.orderId }} />
        ))]

    return (
        <Tree
            contract="agentos-route-page"
            render={defineContractComponent("agentos-route-page", {
                ...(path === undefined ? {} : { path }),
                heading,
                section,
            })}
        />
    )
}

/** Source-level tier marker for the pure page compositor. */
export const meta = { shape: "page", world: "pure" } as const
