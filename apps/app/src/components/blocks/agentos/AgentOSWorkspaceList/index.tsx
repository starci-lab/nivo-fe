"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { useSession } from "@/modules/auth/session"
import { myAgentWorkspace, type AgentWorkspaceRow } from "@/modules/api/console"
import type { Result } from "@/modules/api/graphql"
import type { FleetStatus } from "@/components/blocks/provisioning/FleetRow"
import { _AgentOSWorkspaceList, type AgentOSWorkspaceListViewProps } from "./component"

const STATUS: Readonly<Record<string, FleetStatus | undefined>> = {
    active: "active",
    ready: "ready",
    provisioning: "provisioning",
    failed: "failed",
    suspended: "suspended",
}

/** Own the AgentOS workspace query and settle its management-list states. */
export const AgentOSWorkspaceList = () => {
    const t = useTranslations("console")
    const locale = useLocale()
    const router = useRouter()
    const session = useSession()
    const signedIn = session.state.status === "signed-in"
    const [answer, setAnswer] = useState<Result<ReadonlyArray<AgentWorkspaceRow>> | null>(null)

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
        if (answer === null) return { state: "resting", props: { label } }
        if (!answer.ok) return { state: "refused", props: { label, message: t("refusal.unknown") } }
        if (answer.data.length === 0) return { state: "empty", props: { label, message: t("agentos.empty") } }
        return {
            state: "answered",
            on: { openWorkspace: (id) => router.push(`${locale === DEFAULT_LOCALE ? "" : `/${locale}`}/agentos/workspaces/${id}`) },
            props: {
                label,
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

    return <_AgentOSWorkspaceList {...view()} />
}

/** Source-level tier marker for the connected block half. */
export const meta = { shape: "block", world: "connected" } as const
