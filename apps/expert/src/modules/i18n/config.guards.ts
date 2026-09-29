import { LOCALES, type Locale } from "./config"

/** Narrow one untrusted locale to the locales configured for the Expert app. */
export const isLocale = (value: unknown): value is Locale =>
    typeof value === "string" && LOCALES.some((locale) => locale === value)
