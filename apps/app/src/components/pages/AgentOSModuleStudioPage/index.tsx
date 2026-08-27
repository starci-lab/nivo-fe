"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { nivoQueryData, useQueryMyAgentosCustomModuleStudioSwr } from "@/hooks/swr"
import { AgentOSModuleStudioPageBase, AgentOSModuleStudioProjectionProvider } from "./component"

type AgentOSModuleStudioPageProps = { readonly workspaceId: string, readonly moduleId: string }

type StudioPageContentProps = AgentOSModuleStudioPageProps & {
    readonly labels: Parameters<typeof AgentOSModuleStudioPageBase>[0]["labels"]
    readonly onBack: () => void
}

const StudioPageContent = (props: StudioPageContentProps) => <AgentOSModuleStudioPageBase {...props} />

/** Connect localized copy and exact module identity for the resumable studio. */
export const AgentOSModuleStudioPage = ({ workspaceId, moduleId }: AgentOSModuleStudioPageProps) => {
    const t = useTranslations("console.agentos.modules.studioPage")
    const router = useRouter()
    const query = useQueryMyAgentosCustomModuleStudioSwr(workspaceId, moduleId)
    const studio = nivoQueryData(query.data)
    const refresh = async () => { await query.mutate() }
    return <AgentOSModuleStudioProjectionProvider
        value={{ studio, refresh }}
        render={StudioPageContent}
        renderProps={{
            workspaceId,
            moduleId,
            labels: { path: t("path"), modules: t("modules"), title: studio?.module.name ?? t("title"), description: t("description"), eyebrow: t("eyebrow"), sections: t("sections") },
            onBack: () => router.push(`/agentos/workspaces/${workspaceId}/modules`),
        }}
    />
}

/** Source-level tier marker for the connected module studio page. */
export const meta = { shape: "page", world: "connected" } as const
