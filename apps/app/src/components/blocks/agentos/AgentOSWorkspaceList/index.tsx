"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import type { FleetStatus } from "@/components/blocks/provisioning/FleetRow"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { myAgentWorkspace, type AgentWorkspaceRow } from "@/modules/api/console"
import type { Result } from "@/modules/api/graphql"
import { useSession } from "@/modules/auth/session"
import { AgentOSWorkspaceListBase, type AgentOSWorkspaceListViewProps } from "./component"

const STATUS: Readonly<Record<string, FleetStatus | undefined>> = {
    active: "active",
    ready: "ready",
    provisioning: "provisioning",
    failed: "failed",
    suspended: "suspended",
}

/** Own the workspace query and dashboard continuations for the AgentOS collection. */
export const AgentOSWorkspaceList = () => {
    const t = useTranslations("console")
    const locale = useLocale()
    const router = useRouter()
    const session = useSession()
    const signedIn = session.state.status === "signed-in"
    const [answer, setAnswer] = useState<Result<ReadonlyArray<AgentWorkspaceRow>> | null>(null)
    const localeSegment = locale === DEFAULT_LOCALE ? "" : `/${locale}`

    useEffect(() => {
        if (!signedIn) return
        let cancelled = false
        void myAgentWorkspace().then((result) => {
            if (!cancelled) setAnswer(result)
        })
        return () => {
            cancelled = true
        }
    }, [signedIn])

    const view = (): AgentOSWorkspaceListViewProps => {
        const label = t("agentos.workspacesLabel")
        const summary = {
            workspaces: t("agentos.summary.workspaces"),
            workspacesCaption: t("agentos.summary.workspacesCaption"),
            running: t("agentos.summary.running"),
            runningCaption: t("agentos.summary.runningCaption"),
            attention: t("agentos.summary.attention"),
            attentionCaption: t("agentos.summary.attentionCaption"),
        }
        if (answer === null) return { state: "resting", props: { label, summary } }
        if (!answer.ok) return { state: "refused", props: { label, summary, message: t("refusal.unknown") } }
        if (answer.data.length === 0) {
            return {
                state: "empty",
                props: { label, summary, message: t("agentos.emptyDescription"), actionLabel: t("agentos.create") },
                on: { create: () => router.push(`${localeSegment}/agentos/create`) },
            }
        }
        return {
            state: "answered",
            on: { openWorkspace: (id) => router.push(`${localeSegment}/agentos/workspaces/${id}`) },
            props: {
                label,
                summary,
                rows: answer.data.map((workspace) => {
                    const status = STATUS[workspace.status] ?? "not_provisioned"
                    return {
                        id: workspace.id,
                        name: workspace.name ?? t("agentos.kindWorkspace"),
                        detail: workspace.catalogOrder?.id ?? workspace.id,
                        kindLabel: t("agentos.kindWorkspace"),
                        status,
                        statusLabel: t(`status.${status === "not_provisioned" ? "notProvisioned" : status}`),
                    }
                }),
            },
        }
    }

    return <AgentOSWorkspaceListBase {...view()} />
}

/** Source-level tier marker for the connected block half. */
export const meta = { shape: "block", world: "connected" } as const
