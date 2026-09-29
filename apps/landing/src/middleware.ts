import createMiddleware from "next-intl/middleware"
import { routing } from "./modules/i18n/routing"

/**
 * Resolve which language a request is in before any route renders: the path first, then the
 * `Accept-Language` header, so a shared link always wins over the recipient's browser preference.
 */
export default createMiddleware(routing)

/** Everything except the API, Next's build output and anything with a file extension. */
export const config = {
    matcher: ["/((?!api|_next|_vercel|.*[.].*).*)"],
}
