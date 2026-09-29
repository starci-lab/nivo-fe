import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ push: vi.fn() }))
type TemplatePageProbeProps = { readonly props: { readonly mode: string }, readonly on: { readonly openApps: () => void } }
vi.mock("@/hooks", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("./component", () => ({ TemplateAppProvisioningPageBase: ({ props, on }: TemplatePageProbeProps) => <button type="button" onClick={on.openApps}>{props.mode}</button> }))
import { TemplateAppProvisioningPage } from "."

describe("TemplateAppProvisioningPage", () => {
    it("preserves locale when leaving the lifecycle", () => {
        render(<TemplateAppProvisioningPage mode="resume" siteId="site-1" />)
        fireEvent.click(screen.getByRole("button", { name: "resume" }))
        expect(mocks.push).toHaveBeenCalledWith("/apps")
    })
})