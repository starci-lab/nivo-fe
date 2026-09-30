import { fireEvent, render, screen } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"

type AcademyPageProbeProps = {
    readonly props: { readonly siteId: string; readonly mode: string }
    readonly on: { readonly selectMode: (mode: "system") => void }
}

vi.mock("./component", () => ({
    AcademyControlCenterPageBase: ({ props, on }: AcademyPageProbeProps) => (
        <button type="button" onClick={() => on.selectMode("system")}>
            {props.siteId}:{props.mode}
        </button>
    ),
}))
vi.mock("@/hooks/auth/useSession", () => ({
    useSession: () => ({ state: { status: "signed-in", accessToken: "academy-control-center-token" } }),
}))
vi.mock("@/modules/api/expert-sites", () => ({
    myExpertSites: vi.fn().mockResolvedValue({
        ok: true,
        data: [{ id: "site-1", slug: "academy", customDomain: null, provisionStatus: "ready", status: "live" }],
    }),
}))
vi.mock("@/modules/api/academy", () => ({
    myAcademyGrowthSnapshot: vi.fn().mockResolvedValue({
        ok: true,
        data: { revenueVnd: 1000, paidOrders: 1, totalMembers: 2, activeMembers: 1, totalCompletions: 3 },
    }),
    myAcademyStudents: vi.fn().mockResolvedValue({ ok: true, data: { items: [], total: 0 } }),
    myExpertSiteLeads: vi.fn().mockResolvedValue({ ok: true, data: [] }),
}))
import { AcademyControlCenterPage } from "."

if (!Element.prototype.getAnimations) Element.prototype.getAnimations = () => []

beforeEach(() => {
    window.matchMedia = vi
        .fn()
        .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
})

afterEach(() => {
    for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key)
})

describe("AcademyControlCenterPage", () => {
    it("owns Growth/System mode for the persisted site", () => {
        render(<AcademyControlCenterPage siteId="site-1" />)
        fireEvent.click(screen.getByRole("button", { name: "site-1:growth" }))
        expect(screen.getByRole("button", { name: "site-1:system" })).toBeInTheDocument()
    })

    // The probe above stands in for the page drawing, so the accessibility check re-registers the
    // real `./component` for its own module registry and renders the settled Growth tab.
    it("has no axe violations", async () => {
        vi.resetModules()
        vi.doMock("./component", async () => await vi.importActual("./component"))
        const { AcademyControlCenterPage: ConnectedAcademyControlCenterPage } = await import(".")
        const { container } = render(<ConnectedAcademyControlCenterPage siteId="site-1" />)
        await screen.findAllByText("academy")
        await expectNoA11yViolations(container)
        vi.doUnmock("./component")
    })
})
