"use client"

import { useEffect, useRef } from "react"
import { issueAgentWorkspaceAppLaunch, revokeAgentWorkspaceAppLaunch } from "@/modules/api/console"
import { useSession } from "@/modules/auth/session"
import { followWorkspaceAppRedirect, safeWorkspaceAppRedirect, workspaceAppLaunchChannelName, type WorkspaceAppLaunchMessage } from "@/modules/window/workspace-app-launch"

/** Exact workspace identity supplied by the dedicated launch route. */
export type AgentOSOpenClawLaunchBridgeProps = { readonly workspaceId: string }

/** Issue a launch inside a native new tab, notify its Nivo owner, then leave no credential in FE state. */
export const AgentOSOpenClawLaunchBridge = ({ workspaceId }: AgentOSOpenClawLaunchBridgeProps) => {
    const session = useSession()
    const started = useRef(false)

    useEffect(() => {
        if (session.state.status !== "signed-in" || started.current) return
        started.current = true
        const channel = new BroadcastChannel(workspaceAppLaunchChannelName(workspaceId))
        const publish = (message: WorkspaceAppLaunchMessage) => channel.postMessage(message)
        const launch = async () => {
            const issued = await issueAgentWorkspaceAppLaunch(workspaceId)
            if (!issued.ok) {
                publish({ status: "failed", workspaceId })
                channel.close()
                window.close()
                return
            }
            const destination = safeWorkspaceAppRedirect(issued.data.redirectUrl)
            if (destination === null) {
                await revokeAgentWorkspaceAppLaunch(issued.data.launchId)
                publish({ status: "failed", workspaceId })
                channel.close()
                window.close()
                return
            }
            publish({ status: "issued", workspaceId, launchId: issued.data.launchId })
            channel.close()
            followWorkspaceAppRedirect(destination)
        }
        void launch()
    }, [session.state.status, workspaceId])

    return null
}
