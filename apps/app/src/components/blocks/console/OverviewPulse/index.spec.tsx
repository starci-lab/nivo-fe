import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { OverviewPulseBase, type OverviewPulseProps } from "./component"

const signals: OverviewPulseProps["signals"] = [
    { id: "apps", icon: "apps", label: "Apps", phase: "answered", value: "Needs attention", caption: "Academy is awaiting DNS", emphasis: "accent" },
    { id: "agentos", icon: "agentos", label: "AgentOS", phase: "answered", value: "sales-ops", caption: "Ready" },
    { id: "domains", icon: "domains", label: "Domains", phase: "failed", value: "—", caption: "Could not read domains" },
    { id: "wallet", icon: "wallet", label: "Wallet", phase: "pending", value: "", caption: "" },
]

describe("OverviewPulse", () => {
    it("keeps four independently settled named signals without displaying a collection total", () => {
        const html = renderToStaticMarkup(<OverviewPulseBase signals={signals} />)
        expect(html.match(/data-node="account-signal-card"/g)).toHaveLength(4)
        expect(html.match(/data-component="IconTile"/g)).toHaveLength(4)
        expect(html.match(/data-component="NivoUnicornArtwork"/g)).toHaveLength(1)
        expect(html).not.toContain('data-size="metric-lead"')
        expect(html).toContain("Needs attention")
        expect(html).toContain("sales-ops")
        expect(html).toContain("Could not read domains")
        expect(html).not.toContain("3 apps")
    })
})
