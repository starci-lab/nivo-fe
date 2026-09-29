import createMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"
import { DEFAULT_LOCALE } from "./modules/i18n/config"
import { routing } from "./modules/i18n/routing"

const resolveRequestLocale = createMiddleware(routing)

/**
 * Detect the standalone router's self-proxy hop and stand aside.
 *
 * `NextResponse.rewrite` mints its target inside the worker from `request.nextUrl`, which `NextURL`
 * has already normalized - `127.x.x.x` and `[::1]` collapse to `localhost`. The standalone router
 * then relativizes that absolute URL against the hostname the server was BOUND with, verbatim:
 * bound to `127.0.0.1` (or `[::1]`), the internal rewrite for an unprefixed default-locale route is
 * classified as external and proxied back to `localhost:PORT` - the same server. `proxyRequest`
 * stamps `x-forwarded-host` on that hop, and the sub-request always lands on the prefixed path
 * (`/{defaultLocale}/...`) the rewrite pointed at.
 *
 * Letting that sub-request run the locale middleware again canonicalizes the prefix right back off,
 * answering the rewrite with a 307 to the ORIGINAL path - the endless self-redirect. Standing aside
 * lets the prefixed route render in place instead. A `/{defaultLocale}` request that really did
 * arrive through a forward proxy merely skips the cosmetic prefix-strip.
 */
const isStandaloneSelfProxy = (request: NextRequest): boolean =>
    request.headers.has("x-forwarded-host") &&
    (request.nextUrl.pathname === `/${DEFAULT_LOCALE}` || request.nextUrl.pathname.startsWith(`/${DEFAULT_LOCALE}/`))

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
const middleware = (request: NextRequest) => {
    if (isStandaloneSelfProxy(request)) return NextResponse.next()
    return resolveRequestLocale(request)
}

export default middleware

/** Which paths the locale middleware runs on: everything except API, build output and real files. */
export const config = {
    matcher: ["/((?!api|_next|_vercel|.*[.].*).*)"],
}
