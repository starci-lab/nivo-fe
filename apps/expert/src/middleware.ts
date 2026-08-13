import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

/**
 * Resolves the locale before the route is matched.
 *
 * WHAT IT ACTUALLY DOES, since "locale middleware" hides three separate jobs: it reads the locale
 * out of the path when one is there, negotiates from `Accept-Language` when the visitor lands on
 * the bare path, and remembers a deliberate choice so the next visit does not argue with it. Only
 * the first of those is what makes the page addressable; the other two are what stop a Vietnamese
 * reader having to find the link every time.
 *
 * THE MATCHER EXCLUDES EVERYTHING THAT IS NOT A PAGE. `_next` is the build output, and a static
 * file has no language to negotiate -- running this over them would put a redirect in front of
 * every script tag on the page.
 */
export default createMiddleware(routing)

/** Which paths the locale middleware runs on: everything except API, build output and real files. */
export const config = {
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
