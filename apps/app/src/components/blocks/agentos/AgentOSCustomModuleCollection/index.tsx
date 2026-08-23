"use client"

import { useCallback, useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { myAgentosCustomModules, type AgentosCustomModule } from "@/modules/api/console"
import { useSession } from "@/modules/auth/session"
import { AgentOSCustomModuleCollectionBase } from "./component"

type AgentOSCustomModuleCollectionProps = { readonly workspaceId: string }

/** Own the workspace custom-module query and route each exact continuation. */
export const AgentOSCustomModuleCollection = ({ workspaceId }: AgentOSCustomModuleCollectionProps) => {
    const t = useTranslations("console.agentos.modules")
    const locale = useLocale()
    const router = useRouter()
    const session = useSession()
    const [modules, setModules] = useState<ReadonlyArray<AgentosCustomModule> | null | undefined>()
    const load = useCallback(async () => {
        const result = await myAgentosCustomModules(workspaceId)
        setModules(result.ok ? result.data : null)
    }, [workspaceId])
    useEffect(() => { if (session.state.status === "signed-in") void load() }, [load, session.state.status])
    const open = (module: AgentosCustomModule) => router.push(module.installationId === null ? `/${locale}/agentos/workspaces/${workspaceId}/modules/studio/${module.id}` : `/${locale}/agentos/workspaces/${workspaceId}/modules/${module.installationId}`)
    return <AgentOSCustomModuleCollectionBase state={modules === undefined ? "loading" : modules === null ? "refused" : modules.length === 0 ? "empty" : "ready"} title={t("collection.title")} refused={t("collection.refused")} empty={t("collection.empty")} createLabel={t("collection.create")} rows={(modules ?? []).map((module) => ({ id: module.id, name: module.name, detail: t("collection.progress", { progress: module.progress }), kind: t("collection.custom"), status: t(`status.${module.status}`), action: module.status === "active" ? t("collection.inspect") : t("collection.resume") }))} onOpen={(id) => { const module = modules?.find((item) => item.id === id); if (module !== undefined) open(module) }} onCreate={() => router.push(`/${locale}/agentos/workspaces/${workspaceId}/modules/create`)} />
}

/** Source-level tier marker for the connected collection owner. */
export const meta = { shape: "block", world: "connected" } as const
