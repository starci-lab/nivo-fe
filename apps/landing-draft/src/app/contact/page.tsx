import type { Metadata } from "next"
import { normalizeContactIntent } from "@/features/pages/explore"
import { ContactPage } from "@/features/pages/ContactPage"

/** Search and sharing metadata for the canonical Contact route. */
export const metadata: Metadata = {
    title: "Liên hệ NIVO", // vn-ok: Canonical Vietnamese public label.
    description: "Chọn đúng relationship intent và đi thẳng tới canonical answer trước khi cung cấp dữ liệu không cần thiết.", // vn-ok: Canonical Vietnamese public copy.
    alternates: { canonical: "/contact" },
}

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
const ContactRoute = async (props: ContactRouteProps) => {
    const query = await props.searchParams

    return <ContactPage initialIntent={normalizeContactIntent(query.intent)} />
}

export default ContactRoute