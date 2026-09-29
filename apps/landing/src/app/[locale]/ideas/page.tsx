import type { Metadata } from "next"
import { pageMetadata, type LocaleParams } from "@/features/layouts/SiteShell"
import { IdeasPage, normalizeIdeaType } from "@/features/pages/explore"

/** Search and sharing metadata for the canonical Ideas route, in the routed language. */
export const generateMetadata = ({ params }: LocaleParams): Promise<Metadata> => pageMetadata({ params, page: "explore.ideas", path: "/ideas" })

type IdeasRouteProps = {
    readonly searchParams: Promise<{ readonly type?: string | ReadonlyArray<string> }>
}

/** The `/ideas` framework adapter resolves optional filter state and mounts one page owner. */
const Page = async ({ searchParams }: IdeasRouteProps) => {
    const query = await searchParams
    return <IdeasPage selectedType={normalizeIdeaType(query.type)} />
}

export default Page
