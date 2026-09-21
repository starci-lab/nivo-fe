import { HomePage } from "@/components/site"
import type { Metadata } from "next"
import { SITE_DESCRIPTION, SITE_TITLE } from "@/resources/site"

/** Homepage-only discovery metadata; downstream routes can safely define their own canonical URL. */
export const metadata: Metadata = {
    title: { absolute: SITE_TITLE },
    description: SITE_DESCRIPTION,
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        locale: "vi_VN",
        url: "/",
        siteName: "NIVO",
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
    },
}

/**
 * The `/` route. It mounts the page and nothing else.
 *
 * @returns The route.
 */
const LandingRoute = () => <HomePage />

export default LandingRoute
