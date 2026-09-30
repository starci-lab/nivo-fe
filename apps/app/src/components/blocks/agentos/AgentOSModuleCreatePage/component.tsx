import { Heading, Text } from "@starci/grammar/common"
import { Breadcrumbs, TileIcon } from "@nivo/ui"
import { AgentOSModuleIntake } from "@/components/blocks/agentos/AgentOSModuleIntake"

/** Resolved copy and identifiers the intake-composition screen draws. */
type AgentOSModuleCreatePageBaseData = {
    readonly workspaceId: string
    readonly labels: {
        readonly path: string
        readonly modules: string
        readonly title: string
        readonly description: string
        readonly eyebrow: string
    }
}

/** Actions the connected index wires into the page. */
type AgentOSModuleCreatePageBaseActions = {
    readonly back: () => void
}

/** Props for {@link AgentOSModuleCreatePageBase}: atoms under `props`, actions under `on`. */
type AgentOSModuleCreatePageBaseProps = {
    readonly props: AgentOSModuleCreatePageBaseData
    readonly on: AgentOSModuleCreatePageBaseActions
}

/** Compose the pre-persistence intake route with a reliable modules breadcrumb. */
export const AgentOSModuleCreatePageBase = ({ props, on }: AgentOSModuleCreatePageBaseProps) => {
    return (
        <div>
            <Breadcrumbs
                props={{
                    mode: "back",
                    label: props.labels.path,
                    backLabel: props.labels.modules,
                }}
                on={{
                    back: on.back,
                }}
            />
            <div>
                <div>
                    <TileIcon
                        props={{
                            icon: "agentos",
                        }}
                    />
                    <div>
                        <Text size="sm" tone="accent" weight="semibold">
                            {props.labels.eyebrow}
                        </Text>
                        <Heading level={1} scale="display">
                            {props.labels.title}
                        </Heading>
                        <Text size="md" tone="muted">
                            {props.labels.description}
                        </Text>
                    </div>
                </div>
            </div>
            <AgentOSModuleIntake workspaceId={props.workspaceId} />
        </div>
    )
}
