import type { ComponentProps } from "react"

import { AgentOSInstallationChrome } from "@/features/layouts/AgentOSInstallationChrome"

/*
 * The `/[locale]/agentos/workspaces/[workspaceId]/modules/[installationId]` segment shell.
 *
 * The module subnavigation and the setup/operate/test/settings/diagnostics route tabs live in
 * `features/layouts/AgentOSInstallationChrome`, which is what this file names and mounts.
 */

/** The nested route stream rendered under the installation chrome. */
type AgentOSInstallationRouteProps = {
    readonly children: ComponentProps<"div">["children"]
}

/** Mount the installation chrome around every route nested in this segment. */
const Layout = ({ children }: AgentOSInstallationRouteProps) => (
    <AgentOSInstallationChrome>{children}</AgentOSInstallationChrome>
)

export default Layout
