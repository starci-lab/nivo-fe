import type { Metadata } from "next"
import { EcosystemPage } from "@/components/pages/explore"

/** Search and sharing metadata for the canonical Ecosystem route. */
export const metadata: Metadata = {
    title: "Hệ sinh thái NIVO", // vn-ok: Canonical Vietnamese public label.
    description: "Bốn actor của hệ sinh thái NIVO và cách contribution, evidence, trust cùng tạo shared operating capacity.", // vn-ok: Canonical Vietnamese public copy.
    alternates: { canonical: "/ecosystem" },
}

/** The `/ecosystem` framework adapter. */
const EcosystemRoute = () => <EcosystemPage />

export default EcosystemRoute
