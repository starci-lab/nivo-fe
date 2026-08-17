"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { myAgentosModuleInstallation, type AgentosModuleInstallationDetail } from "@/modules/api/console"
import { useSession } from "@/modules/auth/session"
import useProvisioningRealtime from "@/modules/realtime/provisioning"
import { _AgentOSSolutionModulePage, type AgentOSSolutionModulePageLabels } from "./component"

/** Exact route identities required to read one owner-scoped installation. */
export type AgentOSSolutionModulePageProps = { readonly workspaceId: string; readonly installationId: string }

/** Own the canonical detail snapshot and refresh it on exact Saga updates or reconnect. */
export const AgentOSSolutionModulePage = ({ workspaceId, installationId }: AgentOSSolutionModulePageProps) => {
    const t = useTranslations("console.agentos.workspace.solutions.detail")
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

    const labels: AgentOSSolutionModulePageLabels = {
        title: t("title"),
        loading: t("loading"),
        refused: t("refused"),
        summary: {
            section: t("summary.section"), module: t("summary.module"), version: t("summary.version"),
            status: t("summary.status"), failure: t("summary.failure"), empty: t("empty"),
        },
        bindings: {
            section: t("bindings.section"), agents: t("bindings.agents"), channels: t("bindings.channels"),
            sharedKnowledge: t("bindings.sharedKnowledge"), knowledgeVersions: t("bindings.knowledgeVersions"), empty: t("empty"),
        },
    }
    return <_AgentOSSolutionModulePage state={installation === undefined ? "loading" : installation === null ? "refused" : "ready"} installation={installation ?? undefined} labels={labels} />
}

/** Source-level tier marker for the connected module detail page. */
export const meta = { shape: "page", world: "connected" } as const
