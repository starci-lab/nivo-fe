"use client"

import type { ReactNode } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/hooks/i18n"
import { useQueryMyAgentWorkspaceControlCenterSwr } from "@/hooks/swr"
import { nivoQueryPayload } from "@/modules/query"
import { AgentOSWorkspaceChromeBase, type AgentOSWorkspaceChromeBaseProps } from "./component"

/** The nested route body rendered under this workspace's shared header and tabs. */
type AgentOSWorkspaceChromeProps = {
    readonly children: ReactNode
}

/** The rev-17 workspace destination answering one nested pathname. */
const workspaceTabFor = (pathname: string, modulesRoute: string): "overview" | "modules" =>
    pathname === modulesRoute || pathname.startsWith(`${modulesRoute}/`) ? "modules" : "overview"

/**
 * Keep the visible console chrome and add the exact workspace identity plus its overview/modules
 * route tabs above every nested workspace and installed-module route. Sibling purchase and
 * creation routes live outside this segment, so they never enter this header.
 */
export const AgentOSWorkspaceChrome = (props: AgentOSWorkspaceChromeProps) => {
    const { children }: AgentOSWorkspaceChromeProps = props
    const { workspaceId } = useParams<{ readonly workspaceId: string }>()
    const t = useTranslations("console.agentos")
    const pathname = usePathname()
    const router = useRouter()
    const controlCenter = useQueryMyAgentWorkspaceControlCenterSwr(workspaceId)
    const workspaceName = nivoQueryPayload(controlCenter.data)?.workspace.name ?? workspaceId
    const overviewRoute = `/agentos/workspaces/${workspaceId}`
    const modulesRoute = `${overviewRoute}/modules`
    const input: AgentOSWorkspaceChromeBaseProps = {
        props: {
            eyebrow: t("workspace.eyebrow"),
            name: workspaceName,
            reference: t("workspaceReference", { id: workspaceId }),
            tabsLabel: t("workspace.tabsLabel"),
            overviewLabel: t("workspace.tabs.overview"),
            modulesLabel: t("workspace.tabs.modules"),
            selectedKey: workspaceTabFor(pathname, modulesRoute),
        },
        on: {
            select: (key) => router.push(key === "modules" ? modulesRoute : overviewRoute),
        },
        children,
    }
    return <AgentOSWorkspaceChromeBase {...input} />
}

export default AgentOSWorkspaceChrome
