import { createNavigation } from "next-intl/navigation"

export { createNavigation }

/** Create an href formatter that prefixes only local paths and preserves query and hash tails. */
export const createLocalizeHref =
    <Locale extends string>(getPathname: (input: { readonly href: string; readonly locale: Locale }) => string) =>
    (href: string, locale: Locale): string => {
        if (!href.startsWith("/")) return href

        const tailAt = href.search(/[?#]/u)
        const path = tailAt === -1 ? href : href.slice(0, tailAt)
        const tail = tailAt === -1 ? "" : href.slice(tailAt)
        return `${getPathname({ href: path, locale })}${tail}`
    }
