import { fireEvent, render, screen } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"

const mocks = vi.hoisted(() => ({ push: vi.fn() }))
type TemplatePageProbeProps = {
    readonly props: { readonly mode: string }
    readonly on: { readonly openApps: () => void }
}
vi.mock("@/hooks", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useRouter: () => ({ push: mocks.push }),
    useProvisioningRealtime: () => ({ status: "disconnected", event: undefined }),
}))
vi.mock("@/hooks/auth/useSession", () => ({
    useSession: () => ({ state: { status: "signed-in", accessToken: "template-app-provisioning-token" } }),
}))
vi.mock("@/modules/api/expert-sites", () => ({
    myExpertSiteDeployment: vi
        .fn()
        .mockResolvedValue({ ok: true, data: { id: "deployment", status: "running", publicHost: "alpha.vn" } }),
    createExpertSite: vi.fn(),
    publishExpertSite: vi.fn(),
}))
vi.mock("@/modules/api/commerce", () => ({ catalogItems: vi.fn().mockResolvedValue({ ok: true, data: [] }) }))
vi.mock("./component", () => ({
    TemplateAppProvisioningPageBase: ({ props, on }: TemplatePageProbeProps) => (
        <button type="button" onClick={on.openApps}>
            {props.mode}
        </button>
    ),
}))
import { TemplateAppProvisioningPage } from "."

if (!Element.prototype.getAnimations) Element.prototype.getAnimations = () => []

beforeEach(() => {
    window.matchMedia = vi
        .fn()
        .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
})

afterEach(() => {
    for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key)
})

describe("TemplateAppProvisioningPage", () => {
    it("preserves locale when leaving the lifecycle", () => {
        render(<TemplateAppProvisioningPage mode="resume" siteId="site-1" />)
        fireEvent.click(screen.getByRole("button", { name: "resume" }))
        expect(mocks.push).toHaveBeenCalledWith("/apps")
    })

    // The probe above stands in for the page drawing, so the accessibility check re-registers the
    // real `./component` for its own module registry and renders the settled, ready lifecycle.
    it("has no axe violations", async () => {
        vi.resetModules()
        vi.doMock("./component", async () => await vi.importActual("./component"))
        const { TemplateAppProvisioningPage: ConnectedTemplateAppProvisioningPage } = await import(".")
        const { container } = render(<ConnectedTemplateAppProvisioningPage mode="resume" siteId="site-1" />)
        await screen.findByRole("heading", { level: 1 })
        await expectNoA11yViolations(container)
        vi.doUnmock("./component")
    })
})
