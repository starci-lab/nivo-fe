"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useFormatter, useTranslations } from "next-intl"
import {
    issueAgentWorkspaceAppLaunch,
    myAgentWorkspaceControlCenter,
    renewAgentWorkspaceAppLaunch,
    revokeAgentWorkspaceAppLaunch,
    type AgentWorkspaceControlCenter,
} from "@/modules/api/console"
import type { Result } from "@/modules/api/graphql"
import { useSession } from "@/modules/auth/session"
import useProvisioningRealtime from "@/modules/realtime/provisioning"
import { navigateWorkspaceAppPopup, openWorkspaceAppPopup } from "@/modules/window/workspace-app-launch"
import { _AgentOSWorkspacePage, type AgentOSWorkspacePageLabels, type AgentOSWorkspaceSection } from "./component"

/** Exact workspace identity supplied by the detail route. */
export type AgentOSWorkspacePageProps = { readonly workspaceId: string }

/** Own the aggregate snapshot and refetch it on an exact workspace runtime invalidation. */
export const AgentOSWorkspacePage = ({ workspaceId }: AgentOSWorkspacePageProps) => {
    const t = useTranslations("console.agentos.workspace")
    const format = useFormatter()
    const session = useSession()
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null
    const [answer, setAnswer] = useState<Result<AgentWorkspaceControlCenter> | null>(null)
    const [section, setSection] = useState<AgentOSWorkspaceSection>("overview")
    const lastFingerprint = useRef<string | null>(null)
    const load = useCallback(async () => {
        const result = await myAgentWorkspaceControlCenter(workspaceId)
        if (result.ok) lastFingerprint.current = result.data.runtime?.fingerprint ?? null
        setAnswer(result)
    }, [workspaceId])
    const realtime = useProvisioningRealtime({ accessToken, target: accessToken === null ? null : { kind: "workspace", id: workspaceId } })
    const launchId = useRef<string | null>(null)
    const popup = useRef<Window | null>(null)
    const [launchState, setLaunchState] = useState<"idle" | "opening" | "connected" | "blocked" | "expired" | "disconnected">("idle")

    useEffect(() => {
        if (accessToken === null) return
        void load()
    }, [accessToken, load])

    useEffect(() => {
        if (realtime.status !== "event") return
        if (realtime.event.kind === "workspace-runtime" && realtime.event.fingerprint === lastFingerprint.current) return
        if (realtime.event.kind !== "workspace-runtime" && realtime.event.kind !== "workspace") return
        void load()
    }, [load, realtime])

    useEffect(() => {
        const timer = window.setInterval(() => {
            if (popup.current?.closed && launchId.current !== null) {
                const current = launchId.current
                launchId.current = null
                popup.current = null
                setLaunchState("disconnected")
                void revokeAgentWorkspaceAppLaunch(current)
                return
            }
            if (launchId.current !== null) {
                void renewAgentWorkspaceAppLaunch(launchId.current).then((renewed) => {
                    if (!renewed.ok) setLaunchState("expired")
                })
            }
        }, 20_000)
        return () => {
            window.clearInterval(timer)
            if (launchId.current !== null) void revokeAgentWorkspaceAppLaunch(launchId.current)
        }
    }, [])

    const openOpenClaw = useCallback(async () => {
        const openedPopup = openWorkspaceAppPopup(workspaceId)
        if (openedPopup === null) {
            setLaunchState("blocked")
            return
        }
        popup.current = openedPopup
        setLaunchState("opening")
        const issued = await issueAgentWorkspaceAppLaunch(workspaceId)
        if (!issued.ok) {
            openedPopup.close()
            popup.current = null
            setLaunchState("blocked")
            return
        }
        if (launchId.current !== null) void revokeAgentWorkspaceAppLaunch(launchId.current)
        launchId.current = issued.data.launchId
        const navigated = navigateWorkspaceAppPopup(openedPopup, issued.data.redirectUrl)
        setLaunchState(navigated ? "connected" : "blocked")
    }, [workspaceId])

    const labels: AgentOSWorkspacePageLabels = {
        titleFallback: t("titleFallback"),
        loading: t("loading"),
        tabsLabel: t("tabsLabel"),
        tabs: (["overview", "applications", "infrastructure", "operations", "access"] as const).map((id) => ({ id, label: t(`tabs.${id}`) })),
        summary: {
            section: t("summary.section"), status: t("summary.status"), plan: t("summary.plan"),
            allocation: t("summary.allocation"), host: t("summary.host"), chart: t("summary.chart"),
        },
        applications: {
            section: t("applications.section"), openclaw: t("applications.openclaw"), n8n: t("applications.n8n"),
            openclawDescription: t("applications.openclawDescription"), n8nDescription: t("applications.n8nDescription"),
            available: t("applications.available"), unavailable: t("applications.unavailable"), manage: t("applications.manage"),
            unavailableAction: t("applications.unavailableAction"),
            securityUpgradeRequired: t("applications.securityUpgradeRequired"),
            unavailableDetail: t("applications.unavailableDetail"),
            opening: t("applications.opening"), blocked: t("applications.blocked"),
            expired: t("applications.expired"), disconnected: t("applications.disconnected"),
        },
        runtime: {
            section: t("runtime.section"), cpu: t("runtime.cpu"), memory: t("runtime.memory"), requests: t("runtime.requests"),
            limits: t("runtime.limits"), restarts: t("runtime.restarts"), health: t("runtime.health"), fresh: t("runtime.fresh"),
            stale: t("runtime.stale"), unavailable: t("runtime.unavailable"),
        },
        stack: {
            section: t("stack.section"), unavailable: t("stack.unavailable"), release: t("stack.release"),
            chart: t("stack.chart"), storage: t("stack.storage"),
        },
        operations: {
            section: t("operations.section"), note: t("operations.note"), update: t("operations.update"), plan: t("operations.plan"),
            backup: t("operations.backup"), reset: t("operations.reset"), rebuild: t("operations.rebuild"),
        },
    }
    return (
        <_AgentOSWorkspacePage
            state={answer === null ? "loading" : answer.ok ? "ready" : "refused"}
            message={answer !== null && !answer.ok ? t("refused") : undefined}
            data={answer?.ok === true ? answer.data : undefined}
            section={section}
            labels={labels}
            launchState={launchState}
            onSelectSection={setSection}
            onOpenAgentConsole={() => void openOpenClaw()}
            formatDate={(value) => format.dateTime(new Date(value), { dateStyle: "medium", timeStyle: "short" })}
        />
    )
}

/** Source-level tier marker for the connected workspace page twin. */
export const meta = { shape: "page", world: "connected" } as const
