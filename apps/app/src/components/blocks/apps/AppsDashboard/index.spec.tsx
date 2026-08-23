import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    locale: "vi", push: vi.fn(), sites: vi.fn(), instances: vi.fn(), orders: vi.fn(), catalogue: vi.fn(),
    session: { state: { status: "signed-in" } },
}))
vi.mock("next-intl", () => ({ useLocale: () => mocks.locale, useTranslations: () => (key: string) => key, useFormatter: () => ({ number: (value: number) => String(value) }) }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/console", () => ({ myExpertSites: mocks.sites, myInstances: mocks.instances, myCatalogOrders: mocks.orders, catalogItems: mocks.catalogue }))

import { AppsDashboard } from "."

describe("AppsDashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.locale = "vi"
        mocks.session.state.status = "signed-in"
        mocks.sites.mockResolvedValue({ ok: true, data: [] })
        mocks.instances.mockResolvedValue({ ok: true, data: [] })
        mocks.orders.mockResolvedValue({ ok: true, data: [] })
        mocks.catalogue.mockResolvedValue({ ok: true, data: [] })
    })

    it("owns dashboard loading and empty answers", async () => {
        render(<AppsDashboard />)
        await waitFor(() => expect(screen.getAllByText("apps.emptyDescription").length).toBeGreaterThan(0))
        expect(mocks.catalogue).toHaveBeenCalledWith("site_from_template")
    })

    it("routes a supported template to the separate create flow", async () => {
        mocks.locale = "en"
        mocks.catalogue.mockResolvedValue({ ok: true, data: [{ id: "item-1", name: "Academy", tagline: "Learn", templateKey: "ai_academy", tiers: [{ name: "Starter", priceMonthlyVnd: 100 }] }] })
        render(<AppsDashboard />)
        fireEvent.click(await screen.findByRole("button", { name: "apps.build" }))
        expect(mocks.push).toHaveBeenCalledWith("/en/apps/create/ai_academy")
    })
})
