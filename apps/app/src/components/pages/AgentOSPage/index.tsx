"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { AgentOSPageBase, type AgentOSPageProps } from "./component"

/** Resolve page copy and route navigation while child blocks own every request. */
export const AgentOSPage = (props: AgentOSPageProps) => {
    const t = useTranslations("console")
    const locale = useLocale()
    const router = useRouter()
    const localeSegment = locale === DEFAULT_LOCALE ? "" : `/${locale}`
    return (
        <AgentOSPageBase
            {...props}
            labels={{
                path: t("navigationLabel"),
                agentos: t("agentos.title"),
                dashboardDescription: t("agentos.description"),
                createTitle: t("agentos.createTitle"),
                createDescription: t("agentos.createDescription"),
                orderTitle: t("agentos.orderTitle"),
                orderDescription: t("agentos.orderDescription"),
                createAction: t("agentos.create"),
                dashboardEyebrow: t("agentos.dashboardEyebrow"),
                createEyebrow: t("agentos.createEyebrow"),
                orderEyebrow: t("agentos.orderEyebrow"),
            }}
            onOpenDashboard={() => router.push(`${localeSegment}/agentos`)}
            onCreate={() => router.push(`${localeSegment}/agentos/create`)}
        />
    )
}

/** Source-level tier marker for the connected page entry. */
export const meta = { shape: "page", world: "connected" } as const
