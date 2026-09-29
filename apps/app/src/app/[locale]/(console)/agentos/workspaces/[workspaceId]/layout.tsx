import type { ComponentProps } from "react"

import { AgentOSWorkspaceChrome } from "@/features/layouts/AgentOSWorkspaceChrome"

/*
 * The `/[locale]/agentos/workspaces/[workspaceId]` segment shell.
 *
 * The shared header, its workspace identity and the overview/modules route tabs live in
 * `features/layouts/AgentOSWorkspaceChrome`, which is what this file names and mounts.
 */

/** The nested route stream rendered under the workspace chrome. */
type AgentOSWorkspaceRouteProps = {
    readonly children: ComponentProps<"div">["children"]
}

/** Mount the workspace chrome around every route nested in this segment. */
const Layout = ({ children }: AgentOSWorkspaceRouteProps) => <AgentOSWorkspaceChrome>{children}</AgentOSWorkspaceChrome>

export default Layout
