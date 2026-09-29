import { HomePage } from "@/features/pages/HomePage"
import { pageMetadata, type LocaleParams } from "@/features/layouts/SiteShell"

/** Homepage-only discovery metadata: the site title stands alone, without the `| NIVO` suffix. */
export const generateMetadata = ({ params }: LocaleParams) => pageMetadata({ params, page: "site", path: "/", absolute: true })

/**
 * The `/` route. It mounts the page and nothing else.
 *
 * @returns The route.
 */
const Page = () => <HomePage />

export default Page
