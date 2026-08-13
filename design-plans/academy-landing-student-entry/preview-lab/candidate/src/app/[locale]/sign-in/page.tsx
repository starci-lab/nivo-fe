import { setRequestLocale } from "next-intl/server"
import { AuthenticationPage } from "@/components/pages/AuthenticationPage"

/** Next hands the dynamic segment over as a promise. */
type LocaleSegment = { readonly params: Promise<{ readonly locale: string }> }

/**
 * HOST 1 of 2 - the route.
 *
 * This is the address a guard redirects an unauthenticated visitor to, the one a link in an email
 * opens, and the one an OAuth redirect returns to. The overlay covers none of those, which is why
 * both hosts exist.
 *
 * @param input - The locale segment.
 * @returns The route.
 */
const SignInRouteHost = async ({ params }: LocaleSegment) => {
    setRequestLocale((await params).locale)
    return <AuthenticationPage />
}

export default SignInRouteHost
