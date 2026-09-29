import type { Metadata } from "next"
import { pageMetadata, type LocaleParams } from "@/features/layouts/SiteShell"
import { ContactPage, normalizeContactIntent } from "@/features/pages/ContactPage"

/** Search and sharing metadata for the canonical Contact route, in the routed language. */
export const generateMetadata = ({ params }: LocaleParams): Promise<Metadata> => pageMetadata({ params, page: "contact", path: "/contact" })

type ContactRouteProps = {
    readonly searchParams: Promise<{ readonly intent?: string | ReadonlyArray<string> }>
}

/**
 * The `/contact` framework adapter. It resolves the query name and hands it to the page.
 *
 * IT NO LONGER DECIDES ANYTHING. The router used to pick the intent and branch on it here, which
 * made the route the owner of what the screen shows; the intent is resolved into a name by the unit
 * that owns the intent vocabulary, and the page decides what an unresolved or resolved intent looks
 * like.
 *
 * @param props - The routed search parameters.
 * @returns The route.
 */
const Page = async (props: ContactRouteProps) => {
    const query = await props.searchParams

    return <ContactPage initialIntent={normalizeContactIntent(query.intent)} />
}

export default Page