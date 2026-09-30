import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { LOCALES, DEFAULT_LOCALE, toLocale, type Locale, localizeHref } from "@/modules/i18n"

/** The `[locale]` segment every route hands its metadata function. */
export type LocaleParams = { readonly params: Promise<{ readonly locale: string }> }

/** The Open Graph locale tag each routed locale is published as. */
const OPEN_GRAPH_LOCALE = { vi: "vi_VN", en: "en_US" } as const satisfies Record<Locale, string>

/** Which page's metadata to build: its catalog namespace, its site path, and whether its title stands alone. */
type PageMetadataInput = LocaleParams & {
    readonly page: string
    readonly path: string
    readonly absolute?: boolean
}

/**
 * The search and sharing metadata of one page, in the language of the request.
 *
 * The title and description are the page's own `<page>.metadata` catalog entries; the canonical
 * address is the localised path, and every routed locale is offered as an alternate so a crawler
 * finds the other language of the same page.
 *
 * @param input - The routed locale, the catalog namespace of the page, its site path, and whether its title stands alone (no site suffix).
 * @returns The page's metadata.
 */
export const pageMetadata = async ({ params, page, path, absolute = false }: PageMetadataInput): Promise<Metadata> => {
    const locale = toLocale((await params).locale)
    const t = await getTranslations({ locale, namespace: `${page}.metadata` })
    const canonical = localizeHref(path, locale)
    return {
        title: absolute ? { absolute: t("title") } : t("title"),
        description: t("description"),
        alternates: {
            canonical,
            languages: {
                ...Object.fromEntries(LOCALES.map((candidate) => [candidate, localizeHref(path, candidate)])),
                "x-default": localizeHref(path, DEFAULT_LOCALE),
            },
        },
        openGraph: {
            type: "website",
            locale: OPEN_GRAPH_LOCALE[locale],
            url: canonical,
            siteName: "NIVO",
            title: t("title"),
            description: t("description"),
        },
    }
}

/**
 * The site-wide metadata: the title template, the description and the Open Graph identity, in the
 * language of the request. Pages override the parts they own through {@link pageMetadata}.
 *
 * @param input - The routed locale.
 * @returns The metadata every route under the shell inherits.
 */
export const siteMetadata = async ({ params }: LocaleParams): Promise<Metadata> => {
    const locale = toLocale((await params).locale)
    const t = await getTranslations({ locale, namespace: "site.metadata" })
    return {
        title: { default: t("title"), template: "%s | NIVO" },
        description: t("description"),
        openGraph: {
            type: "website",
            locale: OPEN_GRAPH_LOCALE[locale],
            siteName: "NIVO",
            title: t("title"),
            description: t("description"),
        },
        robots: { index: true, follow: true },
    }
}
