"use client"

import { useLocale, useTranslations } from "next-intl"
import { LOCALES, type Locale } from "@/i18n/config"
import { usePathname, useRouter } from "@/i18n/navigation"
import { LanguageMenuBase } from "./component"

/** Connected locale owner for the global navbar. */
export const LanguageMenu = () => {
    const t = useTranslations("console")
    const locale = useLocale() as Locale
    const pathname = usePathname()
    const router = useRouter()

    return (
        <LanguageMenuBase
            props={{
                label: t("locale.label"),
                selectedLocale: locale,
                options: LOCALES.map((id) => ({ id, label: t(`locale.options.${id}`) })),
            }}
            on={{
                select: (next) => {
                    if (next !== locale) {
                        router.replace(`${pathname}${globalThis.location?.search ?? ""}`, { locale: next })
                    }
                },
            }}
        />
    )
}

/** Source-level tier marker for the connected locale block. */
export const meta = { shape: "block", world: "connected", domain: "locale" } as const
