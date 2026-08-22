"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { AgentOSPageBase, type AgentOSPageProps } from "./component"

/** Settle the AgentOS route identity and hand drawing to the pure page twin. */
export const AgentOSPage = (props: AgentOSPageProps) => {
    const t = useTranslations("console")
    const locale = useLocale()
    const router = useRouter()
    const overviewRoute = locale === DEFAULT_LOCALE ? "/overview" : `/${locale}/overview`
    return <AgentOSPageBase
        {...props}
        path={{ label: t("navigationLabel"), overviewLabel: t("nav.overview"), currentLabel: t("agentos.title") }}
        onOpenOverview={() => router.push(overviewRoute)}
    />
}

/** Source-level tier marker for the connected page half. */
export const meta = { shape: "page", world: "connected" } as const
