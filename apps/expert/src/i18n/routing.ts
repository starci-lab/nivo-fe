import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES } from "./config";

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
 * `as-needed`, SO THE DEFAULT KEEPS THE BARE PATH. `/` is English and `/vi` is Vietnamese, rather
 * than `/en` and `/vi`. Every link that exists today keeps working, no redirect stands between a
 * visitor and the page they asked for, and the second language still gets the address it needed.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed"
});
