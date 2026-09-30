import { useLocale } from "next-intl"
import { localizeHref, toLocale } from "@/modules/i18n"

/**
 * The resolver a page uses for every internal link it draws: `href("/company")` is `/company` in
 * Vietnamese and `/en/company` in English. Anything that is not a site path passes through.
 *
 * @returns A function from a site href to the href for the locale being rendered.
 */
export const useLocalizedHref = () => {
    const locale = toLocale(useLocale())
    return (href: string): string => localizeHref(href, locale)
}
