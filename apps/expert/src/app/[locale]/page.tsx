import { setRequestLocale } from "next-intl/server"
import { AcademyPage } from "@/components/pages/AcademyPage"

/** The routed locale segment this route reads. */
interface LocaleSegment {
    /** Next hands the dynamic segment over as a promise. */
    readonly params: Promise<{ readonly locale: string }>
}

/**
 * The `/[locale]` route. It opts the route into static rendering, then mounts the page.
 *
 * READING THE SEGMENT HERE rather than trusting the layout to have done it is what keeps the route
 * renderable on its own, which is how Next treats it. That call is route wiring, not drawing: it
 * tells the framework which locale this render is for and returns nothing to the screen.
 *
 * @param input - The locale segment.
 * @returns The route.
 */
const AcademyRoute = async ({ params }: LocaleSegment) => {
    setRequestLocale((await params).locale)
    return <AcademyPage />
}

export default AcademyRoute
