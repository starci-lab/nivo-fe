"use client"

import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { OverviewDataProvider } from "@/modules/overview/context"
import { OverviewPageBase } from "./component"

/** Connect only the outer page command; blocks own their own shared-data slices. */
export const OverviewPage = () => {
    const t = useTranslations("console")
    const locale = useLocale()
    const router = useRouter()
    const openApps = () => router.push(locale === DEFAULT_LOCALE ? "/apps" : `/${locale}/apps`)
    return (
        <OverviewDataProvider>
            <OverviewPageBase
                title={t("overview.title")}
                lede={t("overview.lede")}
                pathLabel={t("navigationLabel")}
                consoleLabel={t("title")}
                buildAppLabel={t("overview.buildApp")}
                onBuildApp={openApps}
            />
        </OverviewDataProvider>
    )
}

/** Registry identity for the connected operations overview page. */
export const meta = { shape: "page", world: "connected" } as const
