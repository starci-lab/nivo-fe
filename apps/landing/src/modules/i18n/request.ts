import { getRequestConfig } from "next-intl/server"
import { locale as rootLocale } from "next/root-params"
import { TIME_ZONE, toLocale } from "./config"

/**
 * WHERE THE SITE'S COPY COMES FROM, resolved once per request on the server.
 *
 * Every visitor-facing sentence is a key in `src/messages/{vi,en}.json`; a component receives it
 * already resolved and never holds a sentence or chooses a language. The locale is read from the
 * `[locale]` segment through `next/root-params` and validated, because whatever sits in the path is
 * a string from outside and an unknown one would throw on a catalog file that is not there.
 */
export default getRequestConfig(async () => {
    const locale = toLocale(await rootLocale())
    return {
        locale,
        timeZone: TIME_ZONE,
        messages: (await import(`../../messages/${locale}.json`)).default,
    }
})

export { routing } from "./routing"
