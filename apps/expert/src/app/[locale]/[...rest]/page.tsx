import { notFound } from "next/navigation"

/** The unmatched address under a locale: it answers 404 so the locale's own not-found page draws it. */
const Page = () => notFound()

export default Page
