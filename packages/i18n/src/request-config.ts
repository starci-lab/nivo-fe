import type { Messages } from "next-intl"

/** What one app supplies to turn a raw route locale into its request configuration. */
export type RequestConfigOptions<Locale extends string> = {
    readonly toLocale: (value: unknown) => Locale
    readonly timeZone: string
    readonly loadMessages: (locale: Locale) => Promise<Messages>
}

/**
 * Turn a raw route locale into the request configuration: the value passes through the app's
 * validator before it can select a catalogue, so an unsupported locale loads the default one.
 */
export const createRequestResolver =
    <Locale extends string>(options: RequestConfigOptions<Locale>) =>
    async (rawLocale: unknown) => {
        const locale = options.toLocale(rawLocale)
        return {
            locale,
            timeZone: options.timeZone,
            messages: await options.loadMessages(locale),
        }
    }
