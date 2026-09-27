import { getTranslations } from "next-intl/server"
import { Button, PageContainer, SectionHeader, Text } from "@starci/grammar/common"
import { AgentOSWorkspaceList } from "@/components/blocks/agentos/AgentOSWorkspaceList"
import { toLocale } from "@/i18n/config"
import { getPathname } from "@/i18n/navigation"

/** The workspace collection and purchaser entry are owner-scoped live data. */
export const dynamic = "force-dynamic"

/** Keep the resolved section grouping. */
const SECTIONS_CLASS_NAME = "flex min-w-0 flex-col gap-6"

/** Route identity supplied by the locale-aware workspaces segment. */
type AgentOSWorkspacesRouteProps = { readonly params: Promise<{ readonly locale: string }> }

/** Mount the workspaces list and the new-workspace purchase entry. */
const Page = async ({ params }: AgentOSWorkspacesRouteProps) => {
    const { locale } = await params
    const t = await getTranslations("console.agentos")
    return <PageContainer measure="product"><div className={SECTIONS_CLASS_NAME} data-contract="GAP-5">
        <SectionHeader level={1} title={t("workspacesLabel")} description={<Text size="md" tone="muted">{t("workspaceDescription")}</Text>} action={<Button variant="primary" size="lg" href={getPathname({ locale: toLocale(locale), href: "/agentos/workspaces/new" })}>{t("createEyebrow")}</Button>} />
        <AgentOSWorkspaceList />
    </div></PageContainer>
}

export default Page
