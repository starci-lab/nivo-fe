"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { OverviewDataProvider } from "@/modules/overview/context"
import { OverviewPageBase } from "./component"

type OverviewContentProps = Parameters<typeof OverviewPageBase>[0]
const OverviewContent = (props: OverviewContentProps) => <OverviewPageBase {...props} />

/** Connect only the outer page command; blocks own their own shared-data slices. */
export const OverviewPage = () => {
    const t = useTranslations("console")
    const router = useRouter()
    const openApps = () => router.push("/apps")
    return (
        <OverviewDataProvider
            content={OverviewContent}
            contentProps={{
                title: t("overview.title"),
                lede: t("overview.lede"),
                pathLabel: t("navigationLabel"),
                consoleLabel: t("title"),
                buildAppLabel: t("overview.buildApp"),
                onBuildApp: openApps,
            }}
        />
    )
}

/** Registry identity for the connected operations overview page. */
export const meta = { shape: "page", world: "connected" } as const
