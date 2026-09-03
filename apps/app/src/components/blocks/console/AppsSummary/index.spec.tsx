import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    data: { apps: null } as { apps: unknown },
    locale: "vi",
    push: vi.fn(),
}))
vi.mock("next-intl", () => ({
    useLocale: () => mocks.locale,
    useTranslations: () => (key: string) => key,
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/modules/overview/context", () => ({ useOverviewData: () => mocks.data }))

import { AppsSummary } from "."

describe("AppsSummary", () => {
    beforeEach(() => {
        mocks.locale = "vi"
        mocks.push.mockClear()
        mocks.data.apps = null
    })

    it("maps source rows and keeps default-locale navigation bare", () => {
        mocks.data.apps = { ok: true, data: [{ id: "site-1", slug: "academy", customDomain: null, provisionStatus: "awaiting_dns", status: "active" }] }
        render(<AppsSummary />)
        expect(screen.getByText("academy.nivo.vn")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "apps.openSet" }))
        fireEvent.click(screen.getByRole("button", { name: "apps.viewDns academy" }))
        expect(mocks.push).toHaveBeenCalledWith("/apps")
        expect(mocks.push).toHaveBeenCalledWith("/apps/site-1")
    })

    it("localises routes and settles unknown, empty, and refused answers", () => {
        mocks.locale = "en"
        mocks.data.apps = { ok: true, data: [{ id: "site-2", slug: "sales", customDomain: "sales.example", provisionStatus: "mystery", status: "active" }] }
        const { rerender } = render(<AppsSummary />)
        fireEvent.click(screen.getByRole("button", { name: "apps.open sales" }))
        expect(mocks.push).toHaveBeenCalledWith("/apps/site-2")

        mocks.data.apps = { ok: true, data: [] }
        rerender(<AppsSummary />)
        expect(screen.getByText("apps.emptyDescription")).toBeInTheDocument()

        mocks.data.apps = { ok: false, code: "EXPERT_SITE_NOT_FOUND_EXCEPTION" }
        rerender(<AppsSummary />)
        expect(screen.getByText("refusal.EXPERT_SITE_NOT_FOUND_EXCEPTION")).toBeInTheDocument()
    })

    it("leaves a row with no address yet unable to open anything", () => {
        mocks.data.apps = { ok: true, data: [{ id: "site-3", slug: "pending", customDomain: null, provisionStatus: "provisioning", status: "active" }] }
        render(<AppsSummary />)

        fireEvent.click(screen.getByRole("button", { name: "apps.open pending" }))
        expect(mocks.push).not.toHaveBeenCalled()
    })
})
