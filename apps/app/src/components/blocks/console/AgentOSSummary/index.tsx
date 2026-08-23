"use client"

import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import type { BadgeTone } from "@nivo/ui"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { useOverviewData } from "@/modules/overview/context"
import { AgentOSSummaryBase, type AgentOSSummaryState } from "./component"

export type { AgentOSSummaryProps, AgentOSSummaryState, AgentOSSummaryWorkspace } from "./component"

const STATUS_KEY: Readonly<Record<string, string | undefined>> = { provisioning: "status.provisioning", waiting_capacity: "status.provisioning", installing: "status.provisioning", starting: "status.provisioning", active: "status.active", suspended: "status.suspended", failed: "status.failed" }
const STATUS_TONE: Readonly<Record<string, BadgeTone | undefined>> = { provisioning: "accent", waiting_capacity: "warning", installing: "accent", starting: "accent", active: "success", suspended: "neutral", failed: "danger" }
const NAMED_REFUSALS = new Set(["AGENT_WORKSPACE_NOT_FOUND_EXCEPTION", "POD_REGISTRATION_MISSING_EXCEPTION"])

/** Connect one workspace surface to workspace and pod answers. */
export const AgentOSSummary = () => {
    const { workspaces, pod } = useOverviewData()
    const t = useTranslations("console")
    const format = useFormatter()
    const locale = useLocale()
    const router = useRouter()
    const open = (route: string) => router.push(locale === DEFAULT_LOCALE ? route : `/${locale}${route}`)
    const refusal = (code: string | undefined) => code !== undefined && NAMED_REFUSALS.has(code) ? t(`refusal.${code}`) : t("refusal.unknown")
    const statusLabel = (status: string) => STATUS_KEY[status] === undefined ? t("status.unknown") : t(STATUS_KEY[status]!)
    let state: AgentOSSummaryState
    if (workspaces === null || pod === null) state = { phase: "pending" }
    else if (!workspaces.ok || workspaces.data.length === 0) state = { phase: "empty", message: workspaces.ok ? t("agentos.emptyDescription") : refusal(workspaces.code) }
    else {
        const workspace = workspaces.data[0]!
        const runtime = pod.ok
            ? pod.data.reachable ? t("agentos.podReachable") : t("agentos.podUnreachable")
            : refusal(pod.code)
        const checked = pod.ok ? t("agentos.checkedAt", { time: format.dateTime(new Date(pod.data.checkedAt), { hour: "2-digit", minute: "2-digit" }) }) : undefined
        const access = pod.ok
            ? pod.data.tokenConfigured ? `${t("agentos.workspace.applications.available")}${pod.data.tokenHint === null ? "" : ` · ${pod.data.tokenHint}`}` : t("agentos.workspace.applications.unavailable")
            : undefined
        const display = {
            id: workspace.id,
            name: workspace.name ?? t("agentos.kindWorkspace"),
            description: t("agentos.workspaceDescription"),
            statusLabel: statusLabel(workspace.status),
            statusTone: STATUS_TONE[workspace.status] ?? "neutral" as BadgeTone,
            actionLabel: t("agentos.openService"),
            detail: [runtime, access, checked].filter(Boolean).join(" · "),
        }
        state = pod.ok ? { phase: "populated", workspace: display } : { phase: "partial", workspace: display }
    }
    return <AgentOSSummaryBase label={t("agentos.title")} state={state} onOpenService={(id) => open(`/agentos/workspaces/${id}`)} />
}

/** Registry identity for the connected AgentOS summary twin. */
export const meta = { shape: "block", world: "connected" } as const
