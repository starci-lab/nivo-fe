import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AppsDashboardBase, type AppsDashboardViewProps } from "./component"

const props: AppsDashboardViewProps = {
    title: "Apps",
    lede: "Each app has its own lifecycle.",
    buildAppLabel: "Build an app",
    attentionGroupLabel: "Needs attention",
    steadyGroupLabel: "Running and building",
    owned: {
        phase: "answered",
        label: "Your apps",
        rows: [
            { id: "ready", name: "Academy", detail: "academy.test", kindLabel: "Academy", status: "ready", statusLabel: "Running", actionLabel: "Open" },
            { id: "dns", name: "IELTS", detail: "ielts.test", kindLabel: "Academy", status: "awaiting_dns", statusLabel: "Awaiting DNS", actionLabel: "View record" },
            { id: "building", name: "Starter", detail: "Paid order", kindLabel: "Academy", status: "provisioning", statusLabel: "Building" },
        ],
    },
    catalogue: {
        phase: "answered",
        label: "Use another app",
        fact: "Template catalogue",
        offers: [{ id: "academy", templateKey: "ai_academy", name: "AI Academy", tagline: "Teach online", kindLabel: "Template app", priceLabel: "Starter · 490,000 VND", actionLabel: "Build", actionDisabled: false }],
    },
    onBuildTemplate: vi.fn(),
    onOpenOwnedApp: vi.fn(),
}

describe("AppsDashboard drawing", () => {
    it("keeps attention ahead of steady resources without displaying group totals", () => {
        const html = renderToStaticMarkup(<AppsDashboardBase {...props} />)
        expect(html.indexOf("Needs attention")).toBeLessThan(html.indexOf("Running and building"))
        expect(html.indexOf("IELTS")).toBeLessThan(html.indexOf("Academy"))
        expect(html).not.toContain("2 apps")
        expect(html).toContain('data-scale="display"')
    })

    it("keeps the supported catalogue continuation available when the owned set is empty", () => {
        const html = renderToStaticMarkup(<AppsDashboardBase {...props} owned={{ phase: "empty", label: "Your apps", note: "No apps yet" }} />)
        expect(html).toContain("No apps yet")
        expect(html).toContain("Build an app")
        expect(html).toContain("AI Academy")
        expect(html).toContain("No apps")
    })
})
