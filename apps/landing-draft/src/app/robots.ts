import type { MetadataRoute } from "next"
import { PUBLIC_SITE_URL } from "@/resources/site"

/** Public indexing policy and canonical sitemap discovery. */
const robots = (): MetadataRoute.Robots => ({
    rules: {
        userAgent: "*",
        allow: "/",
    },
    sitemap: `${PUBLIC_SITE_URL}/sitemap.xml`,
    host: PUBLIC_SITE_URL,
})

export default robots
