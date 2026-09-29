import type { MetadataRoute } from "next"
import { PUBLIC_SITE_URL } from "@/features/layouts/SiteShell"

const PUBLIC_ROUTES = [
    "",
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

/** Canonical Wave 1 routes plus the three governed Idea objects published in this draft. */
const sitemap = (): MetadataRoute.Sitemap => PUBLIC_ROUTES.map((route) => ({
    url: `${PUBLIC_SITE_URL}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
}))

export default sitemap
