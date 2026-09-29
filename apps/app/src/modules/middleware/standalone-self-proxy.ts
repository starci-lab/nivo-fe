import type { NextRequest } from "next/server"
import { DEFAULT_LOCALE } from "../i18n/config"

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
 * Letting that sub-request run the locale proxy again canonicalizes the prefix right back off,
 * answering the rewrite with a 307 to the ORIGINAL path - the endless self-redirect. Standing aside
 * lets the prefixed route render in place instead. A `/{defaultLocale}` request that really did
 * arrive through a forward proxy merely skips the cosmetic prefix-strip.
 */
export const isStandaloneSelfProxy = (request: NextRequest): boolean => {
    const { pathname } = request.nextUrl
    return (
        request.headers.has("x-forwarded-host") &&
        (pathname === `/${DEFAULT_LOCALE}` || pathname.startsWith(`/${DEFAULT_LOCALE}/`))
    )
}
