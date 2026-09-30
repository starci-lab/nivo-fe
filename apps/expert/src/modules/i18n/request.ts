import { createRequestConfig } from "@nivo/i18n/request"
import { TIME_ZONE, toLocale } from "@/modules/i18n"

/** The request config next-intl loads through the plugin path in `next.config.ts`: this app's catalogues, per routed locale. */
export default createRequestConfig({
    toLocale,
    timeZone: TIME_ZONE,
    loadMessages: async (locale) => (await import(`../../messages/${locale}.json`)).default,
})
