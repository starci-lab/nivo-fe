import { SECTIONS_CLASS_NAME } from "./classNames"
import { BusinessModulesDashboard } from "@/components/blocks/agentos/BusinessModulesDashboard"
import { AgentOSProvisioning } from "@/components/blocks/provisioning/AgentOSProvisioning"
import { Breadcrumbs } from "@nivo/ui"
import { Button, SectionHeader as DirectionHeader, PageContainer as DirectionPage, Text } from "@starci/grammar/common"
/** Route identity for the dashboard, pre-persistence create flow, or persisted order. */
export type AgentOSPageBaseState =
    | {
          readonly mode: "dashboard"
      }
    | {
          readonly mode: "create"
      }
    | {
          readonly mode: "resume"
          readonly orderId: string
      }
/** Page-owned copy resolved by the connected route half. */
export type AgentOSPageLabels = {
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
/** Resolved atoms the page draws; connected blocks keep their own request states. */
type AgentOSPageBaseData = {
    readonly labels: AgentOSPageLabels
}
/** Route commands the connected half binds to locale-aware navigation. */
type AgentOSPageBaseCommands = {
    readonly openDashboard: () => void
    readonly create: () => void
}
/** The page's approved drawing: route identity, resolved copy and bound commands. */
type AgentOSDashboardPageBaseProps = {
    readonly state: AgentOSPageBaseState
    readonly props: AgentOSPageBaseData
    readonly on: AgentOSPageBaseCommands
}
const pageCopy = (state: AgentOSPageBaseState, labels: AgentOSPageLabels) => {
    if (state.mode === "create")
        return {
            title: labels.createTitle,
            description: labels.createDescription,
            eyebrow: labels.createEyebrow ?? labels.agentos,
        }
    if (state.mode === "resume")
        return {
            title: labels.orderTitle,
            description: labels.orderDescription,
            eyebrow: labels.orderEyebrow ?? labels.agentos,
        }
    return {
        title: labels.agentos,
        description: labels.dashboardDescription,
        eyebrow: labels.dashboardEyebrow ?? labels.agentos,
    }
}
/** Compose dashboard, create, and order routes without proxying child request data. */
export const AgentOSDashboardPageBase = (props: AgentOSDashboardPageBaseProps) => {
    const { state, on } = props
    const { labels } = props.props
    const isDashboard = state.mode === "dashboard"
    const { title, description, eyebrow } = pageCopy(state, labels)
    const path = isDashboard ? undefined : (
        <Breadcrumbs
            props={{
                mode: "trail",
                label: labels.path,
                steps: [
                    {
                        id: "agentos",
                        label: labels.agentos,
                    },
                    {
                        id: state.mode,
                        label: title,
                        isCurrent: true,
                    },
                ],
            }}
            on={{
                activate: (id) => {
                    if (id === "agentos") on.openDashboard()
                },
            }}
        />
    )
    const heading = (
        <DirectionHeader
            level={1}
            eyebrow={eyebrow}
            title={title}
            description={
                <Text size="md" tone="muted">
                    {description}
                </Text>
            }
            action={
                isDashboard ? (
                    <Button variant="primary" size="lg" type="button" onPress={on.create}>
                        {labels.createAction}
                    </Button>
                ) : undefined
            }
        />
    )
    const section = isDashboard ? (
        <BusinessModulesDashboard />
    ) : (
        <AgentOSProvisioning
            context={
                state.mode === "create"
                    ? {
                          mode: "new",
                      }
                    : {
                          mode: "resume",
                          orderId: state.orderId,
                      }
            }
        />
    )
    return (
        <DirectionPage measure="product">
            <div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
                {path === undefined ? null : path}
                {heading}
                {section}
            </div>
        </DirectionPage>
    )
}
