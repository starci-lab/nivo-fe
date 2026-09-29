import { createNavigation } from "next-intl/navigation"
import type { Locale } from "./config"
import { routing } from "./routing"

/** Locale-aware navigation owner, created once from the routed locale authority. */
const { getPathname } = createNavigation(routing)

/**
 * The address a link to `href` has for one locale.
 *
 * Only site paths are localised. A fragment, a `mailto:`, an absolute URL or another site's address
 * has no locale prefix and is returned untouched; a query and a fragment ride along after the path.
 *
 * @param href - A site path (`/company`), optionally with a query or fragment, or any other href.
 * @param locale - The locale the link is rendered in.
 * @returns The href to render.
 */
export const localizeHref = (href: string, locale: Locale): string => {
    if (!href.startsWith("/")) return href
    const tailAt = href.search(/[?#]/u)
    const path = tailAt === -1 ? href : href.slice(0, tailAt)
    const tail = tailAt === -1 ? "" : href.slice(tailAt)
    return `${getPathname({ href: path, locale })}${tail}`
}
