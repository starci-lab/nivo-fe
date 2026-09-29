import { createI18nConfig } from "@nivo/i18n/config"

const config = createI18nConfig({
    locales: ["vi", "en"],
    defaultLocale: "vi",
    timeZone: "Asia/Ho_Chi_Minh",
})

export const { LOCALES, DEFAULT_LOCALE, TIME_ZONE, toLocale, toLocaleFromPathname } = config
export type Locale = (typeof LOCALES)[number]
