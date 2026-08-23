"use client"

import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { DEFAULT_LOCALE } from "@/i18n/config"
import { TemplateAppProvisioningPageBase, type TemplateAppProvisioningPageProps } from "./component"

/** Resolve route-level copy and navigation around the connected lifecycle block. */
export const TemplateAppProvisioningPage = (props: TemplateAppProvisioningPageProps) => {
    const t = useTranslations("console")
    const locale = useLocale()
    const router = useRouter()
    const localeSegment = locale === DEFAULT_LOCALE ? "" : `/${locale}`
    return (
        <TemplateAppProvisioningPageBase
            {...props}
            labels={{
                path: t("navigationLabel"),
                apps: t("apps.title"),
                createTitle: t("apps.createTitle"),
                createDescription: t("apps.createDescription"),
                provisioningTitle: t("apps.provisioningTitle"),
                provisioningDescription: t("apps.provisioningDescription"),
            }}
            onOpenApps={() => router.push(`${localeSegment}/apps`)}
        />
    )
}

/** Source-level tier marker for the connected page entry. */
export const meta = { shape: "page", world: "connected" } as const
