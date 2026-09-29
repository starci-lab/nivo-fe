import { defineRouting } from "next-intl/routing"
import { DEFAULT_LOCALE, LOCALES } from "./config"

/**
 * The locale lives in the URL.
 *
 * WHY IT MOVED OUT OF A COOKIE. A cookie is invisible to everyone except the browser holding it, so
 * the Vietnamese page had no address: it could not be linked, could not be indexed, and could not
 * be opened by a second person from a message. `request.ts` named routing as the better answer and
 * the change it was waiting for, and the practical trigger was the `<meta name="description">` —
 * `generateMetadata` runs before a cookie is available to it, so a page rendering in Vietnamese was
 * describing itself to search engines in English. A locale in the path is known early enough.
 *
 * `as-needed`, SO THE DEFAULT KEEPS THE BARE PATH. `/` is Vietnamese and `/en` is English. Every
 * existing bare-path link stays in place, and the second language has an address of its own.
 */
export const routing = defineRouting({
    locales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    localePrefix: "as-needed",
})
