import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { OverviewPageBase, type OverviewPageViewProps } from "./component"

const props: OverviewPageViewProps = {
    title: "Overview",
    apps: { label: "Apps", state: { phase: "empty", message: "No apps" }, onOpenApp: vi.fn() },
    agentOs: { label: "AgentOS", state: { phase: "empty", message: "No workspace" }, onOpenService: vi.fn() },
    infrastructure: { label: "Infrastructure", context: "No built services", domains: { phase: "empty", note: "No domains" } },
    wallet: { label: "Wallet", state: { phase: "empty", facts: [{ id: "balance", label: "Balance", value: "0 VND" }] } },
}

describe("OverviewPage drawing", () => {
    it("composes the four accepted summary blocks in reading order", () => {
        const html = renderToStaticMarkup(<OverviewPageBase {...props} />)
        expect(html.indexOf("No apps")).toBeLessThan(html.indexOf("No workspace"))
        expect(html.indexOf("No workspace")).toBeLessThan(html.indexOf("Infrastructure"))
        expect(html.indexOf("Infrastructure")).toBeLessThan(html.indexOf("Wallet"))
        expect(html).toContain("No domains")
        expect(html).toContain("0 VND")
    })
})
