import { createAppI18n } from "@nivo/i18n/app"

const i18n = createAppI18n({
    locales: ["vi", "en"],
    defaultLocale: "vi",
    timeZone: "Asia/Ho_Chi_Minh",
})

/** Locale settings and helpers configured for the expert app. */
export const { LOCALES, DEFAULT_LOCALE, TIME_ZONE, toLocale, toLocaleFromPathname, isLocale } = i18n
/** Locale-aware navigation and href helpers configured for the expert app. */
export const { routing, navigation, Link, redirect, getPathname, localizeHref } = i18n
/** One of the locales shipped by the expert app. */
export type Locale = (typeof LOCALES)[number]
