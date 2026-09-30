import type { ReactNode } from "react"
import { AgentOSWorkspaceChrome as AgentOSWorkspaceChromeBlock } from "@/components/blocks/agentos/AgentOSWorkspaceChrome"

/** Route layout input for the workspace chrome block. */
type AgentOSWorkspaceChromeProps = {
    readonly children: ReactNode
}

/** Mount the interactive workspace navigation inside the route layout. */
export const AgentOSWorkspaceChrome = ({ children }: AgentOSWorkspaceChromeProps) => (
    <AgentOSWorkspaceChromeBlock>{children}</AgentOSWorkspaceChromeBlock>
)

export default AgentOSWorkspaceChrome