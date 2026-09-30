import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"

const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    sites: vi.fn(),
    instances: vi.fn(),
    orders: vi.fn(),
    catalogue: vi.fn(),
    session: { state: { status: "signed-in", accessToken: "apps-dashboard-0" } },
}))
vi.mock("@/modules/i18n/navigation", () => ({ navigation: { useRouter: () => ({ push: mocks.push }) } }))
vi.mock("@/hooks/auth/useSession", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/expert-sites", () => ({ myExpertSites: mocks.sites }))
vi.mock("@/modules/api/instances", () => ({ myInstances: mocks.instances }))
vi.mock("@/modules/api/commerce", () => ({ myCatalogOrders: mocks.orders, catalogItems: mocks.catalogue }))

import { AppsDashboard } from "."

describe("AppsDashboard", () => {
    let viewerSequence = 0

    beforeEach(() => {
        vi.clearAllMocks()
        viewerSequence += 1
        mocks.session.state.status = "signed-in"
        mocks.session.state.accessToken = `apps-dashboard-${viewerSequence}`
        mocks.sites.mockResolvedValue({ ok: true, data: [] })
        mocks.instances.mockResolvedValue({ ok: true, data: [] })
        mocks.orders.mockResolvedValue({ ok: true, data: [] })
        mocks.catalogue.mockResolvedValue({ ok: true, data: [] })
    })

    it("owns dashboard loading and empty answers", async () => {
        render(<AppsDashboard />)
        await waitFor(() =>
            expect(screen.getAllByText("Pick a template below to build the first one.").length).toBeGreaterThan(0),
        )
        expect(mocks.catalogue).toHaveBeenCalledWith("site_from_template")
    })

    it("routes a supported template to the separate create flow", async () => {
        mocks.catalogue.mockResolvedValue({
            ok: true,
            data: [
                {
                    id: "item-1",
                    name: "Academy",
                    tagline: "Learn",
                    templateKey: "ai_academy",
                    tiers: [{ name: "Starter", priceMonthlyVnd: 100 }],
                },
            ],
        })
        render(<AppsDashboard />)
        fireEvent.click(await screen.findByRole("button", { name: "Build" }))
        expect(mocks.push).toHaveBeenCalledWith("/apps/create/ai_academy")
    })

    it("has no axe violations", async () => {
        mocks.catalogue.mockResolvedValue({
            ok: true,
            data: [
                {
                    id: "item-1",
                    name: "Academy",
                    tagline: "Learn",
                    templateKey: "ai_academy",
                    tiers: [{ name: "Starter", priceMonthlyVnd: 100 }],
                },
            ],
        })
        const { container } = render(<AppsDashboard />)
        await screen.findByRole("button", { name: "Build" })
        await expectNoA11yViolations(container)
    })
})
