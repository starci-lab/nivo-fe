import type { Metadata } from "next"
import { IdeasPage, normalizeIdeaType } from "@/components/pages/explore"

/** Search and sharing metadata for the canonical Ideas route. */
export const metadata: Metadata = {
    title: "Ideas",
    description: "Knowledge surface của NIVO: Góc nhìn, Framework và điều NIVO đang xây quanh Responsibility-Centered AI-Native Business.", // vn-ok: Canonical Vietnamese public copy.
    alternates: { canonical: "/ideas" },
}

type IdeasRouteProps = {
    readonly searchParams: Promise<{ readonly type?: string | readonly string[] }>
}

/** The `/ideas` framework adapter resolves optional filter state and mounts one page owner. */
const IdeasRoute = async ({ searchParams }: IdeasRouteProps) => {
    const query = await searchParams
    return <IdeasPage selectedType={normalizeIdeaType(query.type)} />
}

export default IdeasRoute
