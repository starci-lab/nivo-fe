import { setRequestLocale } from "next-intl/server"
import { LandingWithQuickEntry } from "@/components/pages/LandingWithQuickEntry"

/** Next hands the dynamic segment over as a promise. */
type LocaleSegment = { readonly params: Promise<{ readonly locale: string }> }

/**
 * HOST 2 of 2 - the landing that summons the overlay.
 *
 * The landing itself is production's, and the candidate does not rebuild it: what is under review
 * here is the SEAM - a reader on the academy page entering without losing it.
 *
 * @param input - The locale segment.
 * @returns The route.
 */
const LandingHost = async ({ params }: LocaleSegment) => {
    setRequestLocale((await params).locale)
    return <LandingWithQuickEntry />
}

export default LandingHost
