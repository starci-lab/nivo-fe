"use client"
import {
    useMutateIssueAgentWorkspaceAppLaunchSwr,
    useMutateRevokeAgentWorkspaceAppLaunchSwr,
} from "@/hooks/swr"
import { useRouter } from "@/hooks/i18n"
import { useSession } from "@/hooks/auth"
import {
    followWorkspaceAppRedirect,
    safeWorkspaceAppRedirect,
    workspaceAppLaunchChannelName,
    type WorkspaceAppLaunchMessage,
} from "@/modules/window/workspace-app-launch"
import { workspace } from "../../../../modules/routes"
import { useFormatter, useTranslations } from "next-intl"
import { useId, useState } from "react"
import useSWRImmutable from "swr/immutable"
import { AgentOSOpenClawLaunchBase, type AgentOSOpenClawLaunchLabels, type OpenClawLaunchBlockState } from "./component"
/** Exact workspace identity supplied by the dedicated launch route. */
export type AgentOSOpenClawLaunchProps = {
    readonly workspaceId: string
}
/** Issue a launch inside a native new tab, notify its Nivo owner, then leave no credential in FE state. */
export const AgentOSOpenClawLaunch = (props: AgentOSOpenClawLaunchProps) => {
    const { workspaceId }: AgentOSOpenClawLaunchProps = props
    const session = useSession()
    const t = useTranslations("console.agentos.workspace.launch")
    const format = useFormatter()
    const router = useRouter()
    const { trigger: issueLaunch } = useMutateIssueAgentWorkspaceAppLaunchSwr(workspaceId)
    const { trigger: revokeLaunch } = useMutateRevokeAgentWorkspaceAppLaunchSwr(workspaceId)
    const [retry, setRetry] = useState(0)
    const [launchState, setLaunchState] = useState<OpenClawLaunchBlockState>("issuing")
    const [expiresAt, setExpiresAt] = useState<string>()
    if (session.state.status === "anonymous" && launchState !== "blocked") {
        setLaunchState("blocked")
    }
    /*
     * ONE ISSUANCE PER ATTEMPT. The key carries this mount's id and the attempt counter, so the
     * command runs once when the session is signed in and once more per retry click, never on a
     * refocus or reconnect. The fetcher settles into typed launch states itself and never throws.
     */
    const attemptId = useId()
    useSWRImmutable(
        session.state.status === "signed-in" ? (["OPENCLAW_LAUNCH", workspaceId, attemptId, retry] as const) : null,
        async () => {
            const channel = new BroadcastChannel(workspaceAppLaunchChannelName(workspaceId))
            const publish = (message: WorkspaceAppLaunchMessage) => channel.postMessage(message)
            const block = () => {
                publish({
                    status: "failed",
                    workspaceId,
                })
                channel.close()
                setLaunchState("blocked")
            }
            try {
                const issued = await issueLaunch(undefined)
                if (!issued.ok) return block()
                const destination = safeWorkspaceAppRedirect(issued.data.redirectUrl)
                if (destination === null) {
                    await revokeLaunch(issued.data.launchId)
                    return block()
                }
                publish({
                    status: "issued",
                    workspaceId,
                    launchId: issued.data.launchId,
                })
                channel.close()
                setExpiresAt(issued.data.expiresAt)
                setLaunchState("connected")
                window.requestAnimationFrame(() => followWorkspaceAppRedirect(destination))
            } catch {
                block()
            }
        },
    )
    const labels: AgentOSOpenClawLaunchLabels = {
        title: t("title"),
        workspaceLabel: t("workspaceLabel"),
        securityNote: t("securityNote"),
        returnToWorkspace: t("returnToWorkspace"),
        retry: t("retry"),
        states: {
            issuing: {
                label: t("states.issuing.label"),
                detail: t("states.issuing.detail"),
            },
            connected: {
                label: t("states.connected.label"),
                detail: t("states.connected.detail"),
            },
            blocked: {
                label: t("states.blocked.label"),
                detail: t("states.blocked.detail"),
            },
            expired: {
                label: t("states.expired.label"),
                detail: t("states.expired.detail"),
            },
            disconnected: {
                label: t("states.disconnected.label"),
                detail: t("states.disconnected.detail"),
            },
        },
    }
    const detail =
        launchState === "connected" && expiresAt !== undefined
            ? t("expiresAt", {
                  time: format.dateTime(new Date(expiresAt), {
                      timeStyle: "medium",
                  }),
              })
            : undefined
    return (
        <AgentOSOpenClawLaunchBase
            state={launchState}
            props={{ workspaceId, detail, labels, isRetryPending: retry > 0 && launchState === "issuing" }}
            on={{
                onRetry: () => {
                    setLaunchState("issuing")
                    setRetry((value) => value + 1)
                },
                onReturn: () => router.push(workspace(workspaceId)),
            }}
        />
    )
}
