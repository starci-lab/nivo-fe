import { createRequestConfig } from "@nivo/i18n/request"
import { TIME_ZONE, toLocale } from "./config"

export default createRequestConfig({
    toLocale,
    timeZone: TIME_ZONE,
    loadMessages: async (locale) => (await import(`../../messages/${locale}.json`)).default,
})

export { routing } from "./routing"
