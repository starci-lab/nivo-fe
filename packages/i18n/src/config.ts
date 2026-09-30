/** Settings shared by the server and client parts of one app's i18n module. */
export type I18nSettings<Locales extends readonly [string, ...string[]]> = {
    readonly locales: Locales
    readonly defaultLocale: Locales[number]
    readonly timeZone: string
}

/** Locale values and validation shared by an app's i18n entry points. */
export const createI18nConfig = <const Locales extends readonly [string, ...string[]]>(
    settings: I18nSettings<Locales>,
) => {
    type Locale = Locales[number]

    const toLocale = (value: unknown): Locale =>
        settings.locales.find((locale) => locale === value) ?? settings.defaultLocale

    const toLocaleFromPathname = (pathname: string | null): Locale => toLocale(pathname?.split("/")[1])
    const isLocale = (value: unknown): value is Locale =>
        typeof value === "string" && settings.locales.some((locale) => locale === value)

    return {
        LOCALES: settings.locales,
        DEFAULT_LOCALE: settings.defaultLocale,
        TIME_ZONE: settings.timeZone,
        toLocale,
        toLocaleFromPathname,
        isLocale,
    }
}
