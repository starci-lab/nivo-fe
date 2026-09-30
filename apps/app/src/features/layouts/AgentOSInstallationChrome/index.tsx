import type { ReactNode } from "react"
import { AgentOSInstallationChrome as AgentOSInstallationChromeBlock } from "@/components/blocks/agentos/AgentOSInstallationChrome"

/** Route layout input for the installation chrome block. */
type AgentOSInstallationChromeProps = {
    readonly children: ReactNode
}

/** Mount the interactive installation navigation inside the route layout. */
export const AgentOSInstallationChrome = ({ children }: AgentOSInstallationChromeProps) => (
    <AgentOSInstallationChromeBlock>{children}</AgentOSInstallationChromeBlock>
)

export default AgentOSInstallationChrome