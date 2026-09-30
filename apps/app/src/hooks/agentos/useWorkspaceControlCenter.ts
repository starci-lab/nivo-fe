import { useCallback, useEffect, useState } from "react"
import { useAgentOSShell } from "./useAgentOSShell"
import {
    useMutateRenewAgentWorkspaceAppLaunchSwr,
} from "../swr/mutations/useMutateRenewAgentWorkspaceAppLaunchSwr"
import {
    useMutateRevokeAgentWorkspaceAppLaunchSwr,
} from "../swr/mutations/useMutateRevokeAgentWorkspaceAppLaunchSwr"
import useProvisioningRealtime from "../realtime/useProvisioningRealtime"
import { useEventRevalidationSwr } from "../swr/useEventRevalidationSwr"
import {
    useQueryMyAgentosModuleInstallationsSwr,
} from "../swr/queries/useQueryMyAgentosModuleInstallationsSwr"
import {
    useQueryMyAgentWorkspaceControlCenterSwr,
} from "../swr/queries/useQueryMyAgentWorkspaceControlCenterSwr"
import { useAccessToken } from "../auth/useAccessToken"
import { projectAgentOSShellView } from "@/modules/agentos/workspace-control-center/shell-projection"
import { settle } from "@nivo/api"
import type { AgentOSShellConfigurationDigests } from "@/modules/agentos/workspace-control-center/shell-types"
import type { AgentOSWorkspaceControlCenterStatus } from "@/modules/agentos/workspace-control-center/contracts"
import { createAgentOSWorkspaceControlCenterLabels } from "@/modules/agentos/workspace-control-center/labels"
import { workspaceAppLaunchChannelName, type WorkspaceAppLaunchMessage } from "@/modules/window/workspace-app-launch"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import useSWR from "swr"
import { useIsHydrated } from "@nivo/ui"

/** Own workspace reads, shell evidence, launch lifetime and page actions. */
export const useWorkspaceControlCenter = (workspaceId: string) => {
    const t = useTranslations("console.agentos.workspace")
    const s = useTranslations("console.agentos.shell")
    const format = useFormatter()
    const locale = useLocale()
    const accessToken = useAccessToken()
    const hydrated = useIsHydrated()
    const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(workspaceId)
    // The shell selection stays within this workspace and its own installed module inventory.
    const installations = useQueryMyAgentosModuleInstallationsSwr(workspaceId)
    const instanceId =
        controlCenter.data?.ok === true
            ? (controlCenter.data.data.runtime?.instanceId ?? controlCenter.data.data.instance?.id ?? null)
            : null
    const installationIds =
        installations.data?.ok === true ? installations.data.data.map((installation) => installation.id) : []
    const shell = useAgentOSShell({ workspaceId, instanceId: instanceId ?? "", installationIds })
    const { trigger: renewLaunch } = useMutateRenewAgentWorkspaceAppLaunchSwr(workspaceId)
    const { trigger: revokeLaunch } = useMutateRevokeAgentWorkspaceAppLaunchSwr(workspaceId)
    const [retryPending, setRetryPending] = useState(false)
    const [launchId, setLaunchId] = useState<string | null>(null)
    const [launchState, setLaunchState] = useState<
        "idle" | "opening" | "connected" | "blocked" | "expired" | "disconnected"
    >("idle")
    const answer = controlCenter.data
    const realtime = useProvisioningRealtime({
        accessToken,
        target: accessToken === null ? null : { kind: "workspace", id: workspaceId },
    })
    const refreshControlCenter = controlCenter.mutate
    const currentFingerprint = answer?.ok === true ? (answer.data.runtime?.fingerprint ?? null) : null
    const refreshEvent =
        realtime.status === "event" &&
        (realtime.event.kind === "workspace-runtime" || realtime.event.kind === "workspace") &&
        !(realtime.event.kind === "workspace-runtime" && realtime.event.fingerprint === currentFingerprint)
            ? realtime.event
            : null
    useEventRevalidationSwr(
        refreshEvent === null
            ? null
            : [
                  "workspace-control-center",
                  workspaceId,
                  refreshEvent.kind,
                  refreshEvent.id,
                  refreshEvent.updatedAt,
              ],
        refreshControlCenter,
    )
    useEffect(() => {
        const channel = new BroadcastChannel(workspaceAppLaunchChannelName(workspaceId))
        let activeLaunchId: string | null = null
        // Revocation is best effort: its outcome is deliberately not read.
        const revoke = (launchId: string): void => void settle(() => revokeLaunch(launchId))
        const onMessage = (event: MessageEvent<WorkspaceAppLaunchMessage>): void => {
            if (event.data.workspaceId !== workspaceId) return
            if (event.data.status === "failed") {
                setLaunchState("blocked")
                return
            }
            if (activeLaunchId !== null && activeLaunchId !== event.data.launchId) revoke(activeLaunchId)
            activeLaunchId = event.data.launchId
            setLaunchId(event.data.launchId)
            setLaunchState("connected")
        }
        channel.addEventListener("message", onMessage)
        return () => {
            channel.removeEventListener("message", onMessage)
            channel.close()
            if (activeLaunchId !== null) revoke(activeLaunchId)
        }
    }, [revokeLaunch, workspaceId])
    /*
     * THE LEASE IS RENEWED BY POLLING. SWR owns the 20 s cadence, skips a tick while the previous
     * renewal is still in flight, and stops when the launch id goes away. The tab keeps renewing
     * while hidden or offline, as the lease must outlive both; a refused or failed renewal expires it.
     */
    useSWR(
        launchId === null ? null : (["WORKSPACE_APP_LAUNCH_RENEWAL", workspaceId, launchId] as const),
        ([, , renewedLaunchId]) => renewLaunch(renewedLaunchId),
        {
            refreshInterval: 20000,
            refreshWhenHidden: true,
            refreshWhenOffline: true,
            revalidateOnMount: false,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            revalidateIfStale: false,
            shouldRetryOnError: false,
            onSuccess: (renewed) => {
                if (!renewed.ok) setLaunchState("expired")
            },
            onError: () => setLaunchState("expired"),
        },
    )
    const openAgentConsole = useCallback(() => setLaunchState("opening"), [])
    const retryShell = useCallback(() => {
        const limited = shell.sources.filter(
            (source) => source.state !== "available" || source.freshness === "stale",
        )
        if (limited.length === 0) {
            shell.readSelection()
            return
        }
        for (const source of limited) shell.retrySource(source.identity)
    }, [shell])
    const recheckOperation = useCallback(
        (installationId: string, intentId: string) => shell.retrySource({ kind: "receiver", installationId, intentId }),
        [shell],
    )
    const retryControlCenter = useCallback(async () => {
        setRetryPending(true)
        try {
            await controlCenter.mutate()
        } finally {
            setRetryPending(false)
        }
    }, [controlCenter])
    const labels = createAgentOSWorkspaceControlCenterLabels(t, s)
    const shellView = projectAgentOSShellView(shell, labels.shell)
    const controlCenterState: AgentOSWorkspaceControlCenterStatus =
        answer === undefined ? "loading" : answer.ok ? "ready" : "refused"
    return {
        hydrated,
        controlCenterState,
        message: answer !== undefined && !answer.ok ? t("refused") : undefined,
        data: answer?.ok === true ? answer.data : undefined,
        shell: shellView,
        labels,
        launchState,
        openClawLaunchHref: `/${locale}/launch/agentos/${workspaceId}/openclaw`,
        retryPending,
        isShellRetrying: shellView.retrying,
        onOpenAgentConsole: openAgentConsole,
        onRetry: () => void retryControlCenter(),
        onRetryShell: retryShell,
        onRetryOperation: recheckOperation,
        formatDate: (value: string) =>
            format.dateTime(new Date(value), {
                dateStyle: "medium",
                timeStyle: "short",
            }),
        formatConfiguration: (digests: AgentOSShellConfigurationDigests) => s("configuration.current", digests),
    }
}
