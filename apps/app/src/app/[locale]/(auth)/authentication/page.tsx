import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AuthenticationPage } from "@/features/pages/AuthenticationPage"

/** The route's document metadata: its own title and description in the request's language. */
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("metadata.authentication")
    return {
        title: t("title"),
        description: t("description"),
    }
}

/**
 * The `/authentication` route. It mounts one page and makes no drawing decision - LAYOUT-6.
 *
 * ONE ADDRESS FOR ALL THREE JOURNEYS, matching the named reference. Signing in, opening an account
 * and resetting a password are modes of one surface rather than three routes, so the mode lives in
 * panel state and this file names nothing about it.
 *
 * @returns The route.
 */
const Page = () => <AuthenticationPage />

export default Page
