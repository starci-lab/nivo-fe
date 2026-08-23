"use client"

import { useCallback, useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { myAgentosModuleInstallation, type AgentosModuleInstallationDetail } from "@/modules/api/console"
import { useSession } from "@/modules/auth/session"
import useProvisioningRealtime from "@/modules/realtime/provisioning"
import {
    AgentOSSolutionModuleDetailBase,
    type AgentOSSolutionModuleDetailState,
    type AgentOSSolutionModuleDetailLabels,
} from "./component"

/** Exact route identities required to read one owner-scoped installation. */
export type AgentOSSolutionModuleDetailProps = { readonly workspaceId: string; readonly installationId: string }

/** Settle the detail block state from what the snapshot returned. */
const detailStateOf = (installation: AgentosModuleInstallationDetail | null | undefined): AgentOSSolutionModuleDetailState => {
    if (installation === undefined) return "loading" as const
    return installation === null ? "refused" as const : "ready" as const
}

/** Own the canonical detail snapshot and refresh it on exact Saga updates or reconnect. */
export const AgentOSSolutionModuleDetail = ({ workspaceId, installationId }: AgentOSSolutionModuleDetailProps) => {
    const t = useTranslations("console.agentos.workspace.solutions.detail")
    const locale = useLocale()
    const router = useRouter()
    const session = useSession()
    const accessToken = session.state.status === "signed-in" ? session.state.accessToken : null
    const [installation, setInstallation] = useState<AgentosModuleInstallationDetail | null | undefined>(undefined)
    const load = useCallback(async () => {
        const result = await myAgentosModuleInstallation(installationId)
        setInstallation(result.ok && result.data.agentWorkspaceId === workspaceId ? result.data : null)
    }, [installationId, workspaceId])

    useEffect(() => {
        if (accessToken !== null) void load()
    }, [accessToken, load])
    const realtime = useProvisioningRealtime({ accessToken, target: accessToken === null ? null : { kind: "module-installation", id: installationId } })
    useEffect(() => {
        if (realtime.status !== "event" && realtime.status !== "connected") return
        if (realtime.status === "event" && realtime.event.kind !== "module-installation") return
        void load()
    }, [load, realtime])

    const labels: AgentOSSolutionModuleDetailLabels = {
        title: t("title"),
        backToWorkspace: t("backToWorkspace"),
        loading: t("loading"),
        refused: t("refused"),
        summary: {
            section: t("summary.section"), module: t("summary.module"), version: t("summary.version"),
            status: t("summary.status"), failure: t("summary.failure"), modelProfile: t("summary.modelProfile"), manifest: t("summary.manifest"), empty: t("empty"),
        },
        bindings: {
            section: t("bindings.section"), agents: t("bindings.agents"), channels: t("bindings.channels"),
            sharedKnowledge: t("bindings.sharedKnowledge"), knowledgeVersions: t("bindings.knowledgeVersions"),
            artifact: t("bindings.artifact"), currentness: t("bindings.currentness"), embedding: t("bindings.embedding"), retrievalScope: t("bindings.retrievalScope"), empty: t("empty"),
        },
    }
    return <AgentOSSolutionModuleDetailBase
        detailState={detailStateOf(installation)}
        installation={installation ?? undefined}
        labels={labels}
        onBack={() => router.push(`/${locale}/agentos/workspaces/${workspaceId}`)}
    />
}

/** Source-level tier marker for the connected module detail block. */
export const meta = { shape: "block", world: "connected" } as const
