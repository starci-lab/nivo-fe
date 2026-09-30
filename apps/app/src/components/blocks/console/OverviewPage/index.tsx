"use client"

import { useTranslations } from "next-intl"
import { OverviewDataProvider, useRouter } from "@/hooks"
import { newWorkspace } from "@/modules/routes"
import { OverviewPageBase, type OverviewPageBaseProps } from "./component"
/** Public API role for OverviewPageProps. */
export type OverviewPageProps = { readonly [key: string]: never }

/** Own the one settlement of every slice and hand the page its resolved copy. */
export const OverviewPage = (props: OverviewPageProps) => {
    void props
    const t = useTranslations("console")
    const router = useRouter()
    const openWorkspacePurchase = () => router.push(newWorkspace())
    const input: OverviewPageBaseProps = {
        props: {
            title: t("overview.title"),
            lede: t("overview.lede"),
            pathLabel: t("breadcrumbLabel"),
            consoleLabel: t("title"),
            // The one next step on this page is the same Mua workspace purchase action the AgentOS
            // primary button opens, so it carries that action's label key.
            buildAppLabel: t("agentos.purchase"),
            atAGlanceLabel: t("overview.atAGlance"),
            servicesLabel: t("servicesCaption"),
            accountLabel: t("accountCaption"),
        },
        on: { buildApp: openWorkspacePurchase },
    }
    return <OverviewDataProvider content={OverviewPageBase} contentProps={input} />
}

/** Registry identity for the connected operations overview page. */
