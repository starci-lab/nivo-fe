import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { AppsDashboardBase, type AppsDashboardActions, type AppsDashboardData } from "./component"

const data: AppsDashboardData = {
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
}
const on: AppsDashboardActions = { onBuildTemplate: vi.fn(), onOpenOwnedApp: vi.fn() }

describe("AppsDashboardBase", () => {
    it("keeps attention ahead of steady resources without displaying group totals", () => {
        const html = renderToStaticMarkup(<AppsDashboardBase props={data} on={on} />)
        expect(html.indexOf("Needs attention")).toBeLessThan(html.indexOf("Running and building"))
        expect(html.indexOf("IELTS")).toBeLessThan(html.indexOf("Academy"))
        expect(html).not.toContain("2 apps")
        expect(html).toContain('data-scale="display"')
    })

    it("keeps the supported catalogue continuation available when the owned set is empty", () => {
        const html = renderToStaticMarkup(<AppsDashboardBase props={{ ...data, owned: { phase: "empty", label: "Your apps", note: "No apps yet" } }} on={on} />)
        expect(html).toContain("No apps yet")
        expect(html).toContain("Build an app")
        expect(html).toContain("AI Academy")
        expect(html).toContain("No apps")
    })
})

describe("AppsDashboardBase", () => {
    it("fires AppsPage row and offer actions across resting and refused sections", () => {
        const onBuildTemplate = vi.fn()
        const onOpenOwnedApp = vi.fn()
        const actions: AppsDashboardActions = { onBuildTemplate, onOpenOwnedApp }
        render(<AppsDashboardBase props={{ title: "Apps", lede: "Lede", owned: { phase: "answered", label: "Owned", rows: [{ id: "site-1", name: "Academy", detail: "academy.test", kindLabel: "Academy", status: "ready", statusLabel: "Ready", actionLabel: "Open" }] }, catalogue: { phase: "answered", label: "Catalogue", fact: "Templates", offers: [{ id: "offer-1", templateKey: "ai_academy", name: "Academy", tagline: "Learn", kindLabel: "Template", priceLabel: "100", actionLabel: "Build", actionDisabled: false }] } }} on={actions} />)
        fireEvent.click(screen.getByRole("button", { name: "Build" }))
        for (const link of screen.getAllByRole("link", { name: "Academy" })) fireEvent.click(link)
        expect(onBuildTemplate).toHaveBeenCalledWith("ai_academy")
        expect(onOpenOwnedApp).toHaveBeenCalledWith("site-1")
        render(<AppsDashboardBase props={{ title: "Apps", lede: "Lede", owned: { phase: "resting", label: "Owned" }, catalogue: { phase: "resting", label: "Catalogue", fact: "Fact" } }} on={actions} />)
        render(<AppsDashboardBase props={{ title: "Apps", lede: "Lede", owned: { phase: "refused", label: "Owned", note: "Unavailable" }, catalogue: { phase: "empty", label: "Catalogue", note: "Empty" } }} on={actions} />)
        expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0)
    })
})

describe("AppsDashboardBase", () => {
    it("renders AppsPage owned apps and buyable catalogue offers", () => {
        const html = renderToStaticMarkup(<AppsDashboardBase
            props={{
                title: "Apps",
                lede: "Your applications",
                buildAppLabel: "Build an app",
                attentionGroupLabel: "Needs attention",
                steadyGroupLabel: "Running and building",
                owned: { phase: "answered", label: "Owned", rows: [{ id: "site-1", name: "Academy", detail: "academy.test", kindLabel: "Academy", status: "ready", statusLabel: "Ready", actionLabel: "Open" }] },
                catalogue: { phase: "answered", label: "Catalogue", fact: "Templates", offers: [{ id: "offer-1", templateKey: "ai_academy", name: "Academy", tagline: "Learn", kindLabel: "Template", priceLabel: "100 VND", actionLabel: "Build", actionDisabled: false }] }
            }}
            on={{ onBuildTemplate: vi.fn(), onOpenOwnedApp: vi.fn() }}
        />)
        expect(html).toContain("Your applications")
        expect(html).toContain("Academy")
        expect(html).toContain("Build")
    })
})
