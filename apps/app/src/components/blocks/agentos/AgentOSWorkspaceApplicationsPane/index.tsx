import type { AgentWorkspaceControlCenterFieldsFragment } from "@/modules/api/__generated__/core"

import { AgentOSWorkspaceApplications } from "@/components/blocks/agentos/AgentOSWorkspaceApplications"
import type { AgentOSWorkspaceControlCenterLabels } from "@/modules/agentos/workspace-control-center/labels"


type AgentOSWorkspaceApplicationsPaneProps = {
    readonly data: AgentWorkspaceControlCenterFieldsFragment
    readonly labels: AgentOSWorkspaceControlCenterLabels["applications"]
    readonly launchState: "idle" | "opening" | "connected" | "blocked" | "expired" | "disconnected"
    readonly openClawLaunchHref: string
    readonly onManageOpenClaw: () => void

}

/** Draw application launch choices for the exact workspace. */
export const AgentOSWorkspaceApplicationsPane = (props: AgentOSWorkspaceApplicationsPaneProps) => (
    <AgentOSWorkspaceApplications
        apps={props.data.apps}
        labels={props.labels}
        launchState={props.launchState}
        openClawLaunchHref={props.openClawLaunchHref}
        onManageOpenClaw={props.onManageOpenClaw}
    />
)
