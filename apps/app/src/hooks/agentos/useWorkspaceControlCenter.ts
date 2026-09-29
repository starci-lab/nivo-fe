"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import {
    useAgentOSShell,
    useMutateRenewAgentWorkspaceAppLaunchSwr,
    useMutateRevokeAgentWorkspaceAppLaunchSwr,
    useProvisioningRealtime,
    useQueryMyAgentosModuleInstallationsSwr,
    useQueryMyAgentWorkspaceControlCenterSwr,
    useAccessToken,
} from "@/hooks"
import { projectAgentOSShellView } from "@/modules/agentos/workspace-control-center/shell-projection"
import type { AgentOSWorkspaceControlCenterStatus } from "@/modules/agentos/workspace-control-center/contracts"
import { createAgentOSWorkspaceControlCenterLabels } from "@/modules/agentos/workspace-control-center/labels"
import { workspaceAppLaunchChannelName, type WorkspaceAppLaunchMessage } from "@/modules/window/workspace-app-launch"
import { useFormatter, useLocale, useTranslations } from "next-intl"

const subscribeToHydration = () => () => undefined
const getClientHydration = () => true
const getServerHydration = () => false

/** Own workspace reads, shell evidence, launch lifetime and page actions. */
export const useWorkspaceControlCenter = (workspaceId: string) => {
    const t = useTranslations("console.agentos.workspace")
    const s = useTranslations("console.agentos.shell")
    const format = useFormatter()
    const locale = useLocale()
    const accessToken = useAccessToken()
    const hydrated = useSyncExternalStore(subscribeToHydration, getClientHydration, getServerHydration)
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
    useEffect(() => {
        if (realtime.status !== "event") return
        const currentFingerprint = answer?.ok === true ? (answer.data.runtime?.fingerprint ?? null) : null
        if (realtime.event.kind === "workspace-runtime" && realtime.event.fingerprint === currentFingerprint) return
        if (realtime.event.kind !== "workspace-runtime" && realtime.event.kind !== "workspace") return
        void refreshControlCenter()
    }, [answer, realtime, refreshControlCenter])
    useEffect(() => {
        const channel = new BroadcastChannel(workspaceAppLaunchChannelName(workspaceId))
        let activeLaunchId: string | null = null
        channel.addEventListener("message", (event: MessageEvent<WorkspaceAppLaunchMessage>) => {
            if (event.data.workspaceId !== workspaceId) return
            if (event.data.status === "failed") {
                setLaunchState("blocked")
                return
            }
            if (activeLaunchId !== null && activeLaunchId !== event.data.launchId)
                void revokeLaunch(activeLaunchId).catch(() => undefined)
            activeLaunchId = event.data.launchId
            setLaunchId(event.data.launchId)
            setLaunchState("connected")
        })
        return () => {
            channel.close()
            if (activeLaunchId !== null) void revokeLaunch(activeLaunchId).catch(() => undefined)
        }
    }, [revokeLaunch, workspaceId])
    useEffect(() => {
        if (launchId === null) return
        let renewalInFlight = false
        const timer = window.setInterval(() => {
            if (renewalInFlight) return
            renewalInFlight = true
            void renewLaunch(launchId)
                .then((renewed) => {
                    if (!renewed.ok) setLaunchState("expired")
                })
                .catch(() => setLaunchState("expired"))
                .finally(() => {
                    renewalInFlight = false
                })
        }, 20000)
        return () => window.clearInterval(timer)
    }, [launchId, renewLaunch])
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
        formatConfiguration: (digests) => s("configuration.current", digests),
    }
}
