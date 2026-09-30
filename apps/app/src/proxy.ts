import createMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"
import { routing } from "@/modules/i18n"
import { isStandaloneSelfProxy } from "./modules/middleware/standalone-self-proxy"

const resolveRequestLocale = createMiddleware(routing)

/**
 * Resolve which language a request is in, before any route renders.
 *
 * It reads the path first and the `Accept-Language` header second, so a shared link always wins over
 * whatever the recipient's browser prefers - which is the whole reason the locale is in the address.
 *
 * A request that already looped through the standalone router's self-proxy stands aside instead of
 * resolving a locale again: re-canonicalizing the prefixed path is what turns an unprefixed
 * default-locale route into a 307 to itself when the server is bound to a loopback alias the worker
 * normalizes away (`127.0.0.1`, `[::1]`).
 */
export const proxy = (request: NextRequest) => {
    if (isStandaloneSelfProxy(request)) return NextResponse.next()
    return resolveRequestLocale(request)
}

/**
 * Which requests the resolver sees.
 *
 * Everything except the API, Next's own build output, and anything with a file extension. A static
 * asset has no language, and rewriting its path would only break its URL.
 */
export const config = {
    matcher: ["/((?!api|_next|_vercel|.*[.].*).*)"],
}
