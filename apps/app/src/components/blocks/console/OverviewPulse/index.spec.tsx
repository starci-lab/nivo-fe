import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { OverviewPulse, type OverviewPulseProps } from "./"

const signals: OverviewPulseProps["signals"] = [
    { id: "apps", label: "Apps", phase: "answered", value: "Needs attention", caption: "Academy is awaiting DNS", emphasis: "accent" },
    { id: "agentos", label: "AgentOS", phase: "answered", value: "sales-ops", caption: "Ready" },
    { id: "domains", label: "Domains", phase: "failed", value: "—", caption: "Could not read domains" },
    { id: "wallet", label: "Wallet", phase: "pending", value: "", caption: "" },
]

describe("OverviewPulse", () => {
    it("keeps four independently settled named signals without displaying a collection total", () => {
        const html = renderToStaticMarkup(<OverviewPulse signals={signals} />)
        expect(html.match(/data-node="account-signal-card"/g)).toHaveLength(4)
        expect(html.match(/data-size="metric-lead"/g)).toHaveLength(4)
        expect(html).toContain("Needs attention")
        expect(html).toContain("sales-ops")
        expect(html).toContain("Could not read domains")
        expect(html).not.toContain("3 apps")
    })
})
