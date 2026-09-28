import type { Metadata } from "next"
import { CompanyPage } from "@/features/pages/CompanyPage"

/** Search and sharing metadata for the canonical Company route. */
export const metadata: Metadata = {
    title: "Company",
    description: "NIVO là ai, vì sao tồn tại, đang hướng tới đâu và vận hành theo Human Leads. AI Operates. System Learns.", // vn-ok: Canonical Vietnamese public copy.
    alternates: { canonical: "/company" },
}

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