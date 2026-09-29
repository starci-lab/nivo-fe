import type { MetadataRoute } from "next"
import { PUBLIC_SITE_URL } from "@/features/layouts/SiteShell"
import { LOCALES, type Locale } from "@/modules/i18n/config"
import { localizeHref } from "@/modules/i18n/navigation"

const PUBLIC_ROUTES = [
    "/",
    "/nivo-os",
    "/system-of-responsibility",
    "/applications",
    "/pricing",
    "/ideas",
    "/ideas/responsibility-before-agent",
    "/ideas/context-responsibility-outcome",
    "/ideas/earned-autonomy-needs-evidence",
    "/ecosystem",
    "/company",
    "/trust",
    "/contact",
] as const

/** The absolute URL of one route in one locale; the Vietnamese root is the bare origin. */
const urlOf = (route: string, locale: Locale) => {
    const path = localizeHref(route, locale)
    return path === "/" ? PUBLIC_SITE_URL : `${PUBLIC_SITE_URL}${path}`
}

/** Every public route in every routed locale, each entry naming the other languages of the same page. */
const sitemap = (): MetadataRoute.Sitemap => PUBLIC_ROUTES.flatMap((route) => LOCALES.map((locale) => ({
    url: urlOf(route, locale),
    alternates: { languages: Object.fromEntries(LOCALES.map((alternate) => [alternate, urlOf(route, alternate)])) },
    changeFrequency: route === "/" ? "weekly" as const : "monthly" as const,
    priority: route === "/" ? 1 : 0.7,
})))

export default sitemap
