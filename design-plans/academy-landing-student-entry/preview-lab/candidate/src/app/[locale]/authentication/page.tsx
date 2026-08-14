import { setRequestLocale } from "next-intl/server"
import { AuthenticationPage } from "@/components/pages/AuthenticationPage"

/** Next hands the dynamic segment over as a promise. */
type LocaleSegment = { readonly params: Promise<{ readonly locale: string }> }

/**
 * The routed authentication screen, at the address starci uses.
 *
 * THE ROUTE MOUNTS ONE PAGE AND MAKES NO DRAWING DECISION. Everything visible
 * belongs to `AuthenticationPage`, which the quick-access overlay mounts too --
 * so the two hosts cannot drift apart, because neither can teach the panel
 * which one it is inside.
 *
 * @param input - The locale segment.
 * @returns The route.
 */
const AuthenticationRoute = async ({ params }: LocaleSegment) => {
    setRequestLocale((await params).locale)
    return <AuthenticationPage />
}

export default AuthenticationRoute
