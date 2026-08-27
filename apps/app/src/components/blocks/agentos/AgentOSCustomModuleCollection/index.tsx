"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryMyAgentosCustomModulesSwr } from "@/hooks/swr"
import type { AgentosCustomModule } from "@/modules/api/console"
import { AgentOSCustomModuleCollectionBase } from "./component"

type AgentOSCustomModuleCollectionProps = { readonly workspaceId: string }

const collectionState = (modules: ReadonlyArray<AgentosCustomModule> | null | undefined) => {
    if (modules === undefined) return "loading"
    if (modules === null) return "refused"
    return modules.length === 0 ? "empty" : "ready"
}

/** Own the workspace custom-module query and route each exact continuation. */
export const AgentOSCustomModuleCollection = ({ workspaceId }: AgentOSCustomModuleCollectionProps) => {
    const t = useTranslations("console.agentos.modules")
    const router = useRouter()
    const query = useQueryMyAgentosCustomModulesSwr(workspaceId)
    const modules = query.data === undefined ? undefined : query.data.ok ? query.data.data : null
    const open = (module: AgentosCustomModule) => {
        const route = module.installationId === null
            ? `/agentos/workspaces/${workspaceId}/modules/studio/${module.id}`
            : `/agentos/workspaces/${workspaceId}/modules/${module.installationId}`
        router.push(route)
    }
    return <AgentOSCustomModuleCollectionBase state={collectionState(modules)} title={t("collection.title")} refused={t("collection.refused")} empty={t("collection.empty")} createLabel={t("collection.create")} rows={(modules ?? []).map((module) => ({ id: module.id, name: module.name, detail: t("collection.progress", { progress: module.progress }), kind: t("collection.custom"), status: t(`status.${module.status}`), action: module.status === "active" ? t("collection.inspect") : t("collection.resume") }))} onOpen={(id) => { const module = modules?.find((item) => item.id === id); if (module !== undefined) open(module) }} onCreate={() => router.push(`/agentos/workspaces/${workspaceId}/modules/create`)} />
}

/** Source-level tier marker for the connected collection owner. */
export const meta = { shape: "block", world: "connected" } as const
