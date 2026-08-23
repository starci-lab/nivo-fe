import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ locale: "en", push: vi.fn() }))
type TemplatePageProbeProps = { readonly mode: string, readonly onOpenApps: () => void }
vi.mock("next-intl", () => ({ useLocale: () => mocks.locale, useTranslations: () => (key: string) => key }))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("./component", () => ({ TemplateAppProvisioningPageBase: ({ mode, onOpenApps }: TemplatePageProbeProps) => <button type="button" onClick={onOpenApps}>{mode}</button> }))
import { TemplateAppProvisioningPage } from "."

describe("TemplateAppProvisioningPage", () => {
    it("preserves locale when leaving the lifecycle", () => {
        render(<TemplateAppProvisioningPage mode="resume" siteId="site-1" />)
        fireEvent.click(screen.getByRole("button", { name: "resume" }))
        expect(mocks.push).toHaveBeenCalledWith("/en/apps")
    })
})
