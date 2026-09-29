import { CompanyPage } from "@/features/pages/CompanyPage"
import { pageMetadata, type LocaleParams } from "@/features/layouts/SiteShell"

/** Search and sharing metadata for the canonical Company route, in the language of the request. */
export const generateMetadata = ({ params }: LocaleParams) => pageMetadata({ params, page: "company", path: "/company" })

/**
 * The `/company` framework adapter. It mounts the page and nothing else.
 *
 * IT NO LONGER DECIDES ANYTHING. The profile used to be drawn in this file, so the route chose the
 * shape of every section - and a route that chooses the shape of what it renders is a second page
 * owner, not an adapter. The page lives in `features/pages/CompanyPage`, where its siblings are.
 *
 * @returns The route.
 */
const Page = () => <CompanyPage />

export default Page
