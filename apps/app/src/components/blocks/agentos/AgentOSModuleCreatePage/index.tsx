"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/hooks"
import { workspaceModules } from "@/modules/routes"
import { AgentOSModuleCreatePageBase } from "./component"

/** Route identity supplied by the workspace modules segment. */
type AgentOSModuleCreatePageProps = {
    readonly workspaceId: string
}

/**
 * The `/[locale]/agentos/workspaces/[workspaceId]/modules/create` screen, connected half.
 *
 * THE ROUTE IS A ROUTE AGAIN. `app/.../modules/create/page.tsx` names which page renders at which
 * URL and hands the workspace segment over; the localized copy and the return route into the
 * modules collection are this feature's work.
 */
export const AgentOSModuleCreatePage = (props: AgentOSModuleCreatePageProps) => {
    const { workspaceId }: AgentOSModuleCreatePageProps = props
    const t = useTranslations("console.agentos.modules.createPage")
    const router = useRouter()
    return (
        <AgentOSModuleCreatePageBase
            props={{
                workspaceId,
                labels: {
                    path: t("path"),
                    modules: t("modules"),
                    title: t("title"),
                    description: t("description"),
                    eyebrow: t("eyebrow"),
                },
            }}
            on={{
                back: () => router.push(workspaceModules(workspaceId)),
            }}
        />
    )
}

export default AgentOSModuleCreatePage
