import { locale as rootLocale } from "next/root-params"
import type { Messages } from "next-intl"
import { getRequestConfig } from "next-intl/server"

/**
 * Build the server request config from the root `[locale]` segment while each app keeps its own
 * catalogs. Reading next-intl's deprecated request locale uses a proxy header and makes the route
 * dynamic; the root param is available without giving up prerendering. The value still passes
 * through the app's validator before it can select messages.
 */
export const createRequestConfig = <Locale extends string>(options: {
    readonly toLocale: (value: unknown) => Locale
    readonly timeZone: string
    readonly loadMessages: (locale: Locale) => Promise<Messages>
}) =>
    getRequestConfig(async () => {
        const locale = options.toLocale(await rootLocale())
        return {
            locale,
            timeZone: options.timeZone,
            messages: await options.loadMessages(locale),
        }
    })
