import { getTranslations } from "next-intl/server"
import { toLocale } from "@/modules/i18n/config"
import { getPathname } from "@/modules/i18n/navigation"
import { AgentOSWorkspacesPageBase } from "./component"

/** Route identity supplied by the locale-aware workspaces segment. */
export type AgentOSWorkspacesPageProps = {
    readonly params: Promise<{ readonly locale: string }>
}

/**
 * The `/[locale]/agentos/workspaces` screen, connected half.
 *
 * THE ROUTE IS A ROUTE AGAIN. `app/.../workspaces/page.tsx` names which page renders at which URL
 * and hands the segment over; the translations, the locale-bound href and the composition itself
 * are this feature's work - the moment the route rendered a tree of its own there would be two
 * owners of the screen.
 *
 * @param input - The routed locale segment.
 * @returns The page.
 */
export const AgentOSWorkspacesPage = async ({ params }: AgentOSWorkspacesPageProps) => {
    const { locale } = await params
    const t = await getTranslations("console.agentos")
    return (
        <AgentOSWorkspacesPageBase
            props={{
                title: t("workspacesLabel"),
                description: t("workspaceDescription"),
                createLabel: t("createEyebrow"),
                createHref: getPathname({ locale: toLocale(locale), href: "/agentos/workspaces/new" }),
            }}
        />
    )
}

export default AgentOSWorkspacesPage
