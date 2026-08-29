import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Resolve which language a request is in, before any route renders.
 *
 * It reads the path first and the `Accept-Language` header second, so a shared link always wins over
 * whatever the recipient's browser prefers - which is the whole reason the locale is in the address.
 */
export default createMiddleware(routing);

/**
 * Which requests the resolver sees.
 *
 * Everything except the API, Next's own build output, and anything with a file extension. A static
 * asset has no language, and rewriting its path would only break its URL.
 */
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*[.].*).*)"]
};
