"use client"

import { useTranslations } from "next-intl"
import { useQueryMyAgentosCustomModuleStudioSwr, useRouter } from "@/hooks"
import { AgentOSModuleStudioProjectionProvider } from "@/modules/agentos/module-studio-projection"
import { workspaceModules } from "@/modules/routes"
import { nivoQueryReading } from "@/modules/query"
import { QueryNotice } from "@/components/blocks/query/QueryNotice"
import { AgentOSModuleStudioPageBase } from "./component"
type AgentOSModuleStudioPageProps = {
    readonly workspaceId: string
    readonly moduleId: string
}
/** Connect localized copy and exact module identity for the resumable studio. */
export const AgentOSModuleStudioPage = (props: AgentOSModuleStudioPageProps) => {
    const { workspaceId, moduleId }: AgentOSModuleStudioPageProps = props
    const t = useTranslations("console.agentos.modules.studioPage")
    const router = useRouter()
    const query = useQueryMyAgentosCustomModuleStudioSwr(workspaceId, moduleId)
    const reading = nivoQueryReading(query.data)
    const studio = reading.status === "ready" ? reading.data : undefined
    const refresh = async (): Promise<void> => {
        await query.mutate()
    }
    if (reading.status === "failed") {
        return <QueryNotice props={{ failure: reading }} on={{ retry: () => void query.mutate() }} />
    }
    return (
        <AgentOSModuleStudioProjectionProvider value={{ studio, refresh }}>
            <AgentOSModuleStudioPageBase
                props={{
                    workspaceId: workspaceId,
                    moduleId: moduleId,
                    labels: {
                        path: t("path"),
                        modules: t("modules"),
                        title: studio?.module.name ?? t("title"),
                        description: t("description"),
                        eyebrow: t("eyebrow"),
                        sections: t("sections"),
                    },
                }}
                on={{ back: () => router.push(workspaceModules(workspaceId)) }}
            />
        </AgentOSModuleStudioProjectionProvider>
    )
}
