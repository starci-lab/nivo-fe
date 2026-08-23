"use client"

import { useCallback, useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { myAgentosCustomModuleStudio, type AgentosModuleStudio } from "@/modules/api/console"
import { useSession } from "@/modules/auth/session"
import { AgentOSModuleStudioPageBase } from "./component"

type AgentOSModuleStudioPageProps = { readonly workspaceId: string, readonly moduleId: string }

/** Connect localized copy and exact module identity for the resumable studio. */
export const AgentOSModuleStudioPage = ({ workspaceId, moduleId }: AgentOSModuleStudioPageProps) => {
    const t = useTranslations("console.agentos.modules.studioPage")
    const locale = useLocale()
    const router = useRouter()
    const session = useSession()
    const [studio, setStudio] = useState<AgentosModuleStudio | null>()
    const loadIdentity = useCallback(async () => {
        const result = await myAgentosCustomModuleStudio(workspaceId, moduleId)
        setStudio(result.ok ? result.data : null)
    }, [moduleId, workspaceId])
    useEffect(() => {
        if (session.state.status === "signed-in") void loadIdentity()
    }, [loadIdentity, session.state.status])
    return <AgentOSModuleStudioPageBase workspaceId={workspaceId} moduleId={moduleId} labels={{ path: t("path"), modules: t("modules"), title: studio?.module.name ?? t("title"), description: t("description"), eyebrow: t("eyebrow") }} onBack={() => router.push(`/${locale}/agentos/workspaces/${workspaceId}/modules`)} />
}

/** Source-level tier marker for the connected module studio page. */
export const meta = { shape: "page", world: "connected" } as const
