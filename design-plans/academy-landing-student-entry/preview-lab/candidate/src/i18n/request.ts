import { getRequestConfig } from "next-intl/server"
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./config"

/** Product copy for the candidate, resolved from the routed segment exactly as production does. */
export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale
    const locale = (LOCALES as ReadonlyArray<string>).includes(requested ?? "")
        ? (requested as Locale)
        : DEFAULT_LOCALE
    return {
        locale,
        timeZone: "Asia/Ho_Chi_Minh",
        messages: (await import(`../messages/${locale}.json`)).default,
    }
})
