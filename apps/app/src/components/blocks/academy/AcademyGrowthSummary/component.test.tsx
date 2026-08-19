import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { _AcademyGrowthSummary } from "./component"

const labels = { section: "Growth", health: "Health", loading: "Loading", refused: "Unavailable", revenue: "Revenue", orders: "Orders", members: "Members", completions: "Completions", activeRate: "Active rate" }

describe("academy growth summary states", () => {
    it("renders aggregate facts and calculates the active percentage", () => {
        const html = renderToStaticMarkup(<_AcademyGrowthSummary state="answered" revenue="₫1,000" labels={labels} data={{ revenueVnd: 1000, paidOrders: 4, totalMembers: 8, activeMembers: 6, totalCompletions: 12 }} />)
        expect(html).toContain("₫1,000")
        expect(html).toContain("6/8")
        expect(html).toContain("75")
    })

    it("keeps refused state free of aggregate values and handles zero members", () => {
        const refused = renderToStaticMarkup(<_AcademyGrowthSummary state="refused" revenue="₫1,000" labels={labels} />)
        expect(refused).toContain("Unavailable")
        const zero = renderToStaticMarkup(<_AcademyGrowthSummary state="answered" revenue="₫0" labels={labels} data={{ revenueVnd: 0, paidOrders: 0, totalMembers: 0, activeMembers: 0, totalCompletions: 0 }} />)
        expect(zero).toContain("0/0")
    })
})
