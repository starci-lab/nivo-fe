"use client"

import { useWorkspaceControlCenter } from "@/hooks/agentos/useWorkspaceControlCenter"
import { AgentOSWorkspaceControlCenterBase, type AgentOSWorkspacePageState } from "./component"
export { AGENT_OS_SIGN_IN_HREF } from "./component"
export { AgentOSShellOperationRegion } from "@/components/blocks/agentos/AgentOSShellOperationRegion"
export { projectAgentOSShellView } from "@/modules/agentos/workspace-control-center/shell-projection"
export type { AgentOSShellConfigurationDigests, AgentOSShellView, AgentOSWorkspaceControlCenterShellLabels } from "@/modules/agentos/workspace-control-center/shell-types"

/** Exact workspace identity supplied by the detail route. */
export type AgentOSWorkspaceControlCenterProps = {
    readonly workspaceId: string
    readonly pageState: AgentOSWorkspacePageState
    readonly onSelectPageState: (pageState: AgentOSWorkspacePageState) => void
}

/** Connect the workspace control center to its data hook and compose the pure page. */
export const AgentOSWorkspaceControlCenter = (props: AgentOSWorkspaceControlCenterProps) => {
    const { workspaceId, pageState, onSelectPageState } = props
    const view = useWorkspaceControlCenter(workspaceId)
    if (!view.hydrated) return null
    return (
        <AgentOSWorkspaceControlCenterBase
            state={pageState}
            props={{
                workspaceId,
                controlCenterState: view.controlCenterState,
                message: view.message,
                data: view.data,
                shell: view.shell,
                labels: view.labels,
                launchState: view.launchState,
                openClawLaunchHref: view.openClawLaunchHref,
                retryPending: view.retryPending,
                isShellRetrying: view.isShellRetrying,
            }}
            on={{
                onSelectPageState,
                onOpenAgentConsole: view.onOpenAgentConsole,
                onRetry: view.onRetry,
                onRetryShell: view.onRetryShell,
                onRetryOperation: view.onRetryOperation,
                formatDate: view.formatDate,
                formatConfiguration: view.formatConfiguration,
            }}
        />
    )
}
