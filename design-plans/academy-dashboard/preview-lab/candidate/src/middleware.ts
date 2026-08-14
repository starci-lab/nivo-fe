import createMiddleware from "next-intl/middleware"
import { DEFAULT_LOCALE, LOCALES } from "./i18n/config"

/** Resolves the locale before the route is matched, as production does. */
export default createMiddleware({
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    localePrefix: "as-needed",
})

/** Everything except API, build output and real files. */
export const config = { matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"] }
