import { Badge, SectionHeader, Tabs, Text } from "@starci/grammar/common"
import { SHELL_SOURCE_TIME_CLASS_NAME } from "./classNames"
import type { AgentOSWorkspacePageState } from "@/modules/agentos/workspace-control-center/contracts"

type AgentOSWorkspaceControlCenterHeaderProps = {
    readonly eyebrow: string
    readonly title: string
    readonly description: string
    readonly sourceTime?: {
        readonly label: string
        readonly value: string
    }
    readonly tabsLabel?: string
    readonly pageState?: AgentOSWorkspacePageState
    readonly tabs?: ReadonlyArray<{ readonly id: AgentOSWorkspacePageState; readonly label: string }>
    readonly onSelectPageState?: (pageState: AgentOSWorkspacePageState) => void
}

/** Draw the workspace identity and its page navigation. */
export const AgentOSWorkspaceControlCenterHeader = (props: AgentOSWorkspaceControlCenterHeaderProps) => (
    <>
        <SectionHeader
            level={1}
            eyebrow={props.eyebrow}
            title={props.title}
            description={
                <Text size="md" tone="muted">
                    {props.description}
                </Text>
            }
        />
        {props.sourceTime === undefined ? null : (
            <div className={SHELL_SOURCE_TIME_CLASS_NAME}>
                <Badge tone="neutral">{props.sourceTime.label}</Badge>
                <Text size="sm" tone="muted">
                    {props.sourceTime.value}
                </Text>
            </div>
        )}
        {props.tabs === undefined || props.pageState === undefined || props.tabsLabel === undefined ? null : (
            <Tabs
                label={props.tabsLabel}
                selectedKey={props.pageState}
                items={props.tabs}
                onSelect={(key) => props.onSelectPageState?.(key as AgentOSWorkspacePageState)}
                panelId={(key) => "workspace-panel-" + key}
                labelVisibility="always"
                inset="none"
            />
        )}
    </>
)
