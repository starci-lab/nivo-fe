import type { Metadata } from "next"
import { TrustPage } from "@/components/pages/explore"

/** Search and sharing metadata for the canonical Trust route. */
export const metadata: Metadata = {
    title: "Trust",
    description: "Cách NIVO kết nối Human Accountability, Evidence, Trust, Permission và operating capacity mà không biến future thành current capability.", // vn-ok: Canonical Vietnamese public copy.
    alternates: { canonical: "/trust" },
}

/** The `/trust` framework adapter. */
const TrustRoute = () => <TrustPage />

export default TrustRoute
