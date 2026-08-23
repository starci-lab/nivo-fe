"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { AgentOSModuleCreatePageBase } from "./component"

type AgentOSModuleCreatePageProps = { readonly workspaceId: string }

/** Connect localized copy and the exact return route for module creation. */
export const AgentOSModuleCreatePage = ({ workspaceId }: AgentOSModuleCreatePageProps) => {
    const t = useTranslations("console.agentos.modules.createPage")
    const locale = useLocale()
    const router = useRouter()
    return <AgentOSModuleCreatePageBase workspaceId={workspaceId} labels={{ path: t("path"), modules: t("modules"), title: t("title"), description: t("description"), eyebrow: t("eyebrow") }} onBack={() => router.push(`/${locale}/agentos/workspaces/${workspaceId}/modules`)} />
}

/** Source-level tier marker for the connected module create page. */
export const meta = { shape: "page", world: "connected" } as const
