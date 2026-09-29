import { createI18nConfig } from "@nivo/i18n/config"

const config = createI18nConfig({
    locales: ["vi", "en"],
    defaultLocale: "vi",
    timeZone: "Asia/Ho_Chi_Minh",
})

export const { LOCALES, DEFAULT_LOCALE, TIME_ZONE, toLocale, toLocaleFromPathname } = config
export type Locale = (typeof LOCALES)[number]

/** Whether a raw value is one of the locales this app ships. */
export const isLocale = (value: unknown): value is Locale =>
    typeof value === "string" && LOCALES.some((locale) => locale === value)
