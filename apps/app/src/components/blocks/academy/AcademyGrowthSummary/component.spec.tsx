import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { AcademyGrowthSummaryBase } from "./component"

const labels = {
    section: "Growth",
    health: "Health",
    loading: "Loading",
    revenue: "Revenue",
    orders: "Orders",
    members: "Members",
    completions: "Completions",
    activeRate: "Active rate",
}

describe("AcademyGrowthSummaryBase", () => {
    it("renders aggregate facts and calculates the active percentage", () => {
        const html = renderToStaticMarkup(
            <AcademyGrowthSummaryBase
                state="answered"
                props={{
                    revenue: "₫1,000",
                    labels,
                    data: { revenueVnd: 1000, paidOrders: 4, totalMembers: 8, activeMembers: 6, totalCompletions: 12 },
                }}
            />,
        )
        expect(html).toContain("₫1,000")
        expect(html).toContain("6/8")
        expect(html).toContain("75")
    })

    it("keeps a failed read free of aggregate values and handles zero members", () => {
        const failed = renderToStaticMarkup(
            <AcademyGrowthSummaryBase
                state="failed"
                props={{ revenue: "₫1,000", notice: { message: "Unavailable" }, labels }}
            />,
        )
        expect(failed).toContain("Unavailable")
        expect(failed).not.toContain("₫1,000")
        const zero = renderToStaticMarkup(
            <AcademyGrowthSummaryBase
                state="answered"
                props={{
                    revenue: "₫0",
                    labels,
                    data: { revenueVnd: 0, paidOrders: 0, totalMembers: 0, activeMembers: 0, totalCompletions: 0 },
                }}
            />,
        )
        expect(zero).toContain("0/0")
    })
})
