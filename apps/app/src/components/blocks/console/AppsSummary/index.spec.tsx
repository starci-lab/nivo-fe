import { fireEvent, render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AppsSummaryBase } from "./component"

const mocks = vi.hoisted(() => ({
    data: { apps: null } as { apps: unknown },
    locale: "vi",
    push: vi.fn(),
}))
vi.mock("next-intl", () => ({
    useLocale: () => mocks.locale,
    useTranslations: () => (key: string) => key,
}))
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/modules/overview/context", () => ({ useOverviewData: () => mocks.data }))

import { AppsSummary } from "."

describe("AppsSummary", () => {
    beforeEach(() => {
        mocks.locale = "vi"
        mocks.push.mockClear()
        mocks.data.apps = null
    })

    it("draws owned application identity, lifecycle, and action without a total", () => {
        const html = renderToStaticMarkup(<AppsSummaryBase label="Apps" state={{ phase: "populated", items: [{
            id: "app-1", name: "Store", detail: "store.example", statusLabel: "Ready", statusTone: "success", actionLabel: "Open",
        }] }} onOpenApp={vi.fn()} />)
        expect(html).toContain("Store")
        expect(html).toContain("store.example")
        expect(html).toContain("Ready")
        expect(html).not.toContain("total")
    })

    it("keeps a forbidden answer local to the section", () => {
        const html = renderToStaticMarkup(<AppsSummaryBase label="Apps" state={{ phase: "forbidden", message: "Access denied" }} onOpenApp={vi.fn()} />)
        expect(html).toContain("Access denied")
    })

    it("maps source rows and keeps default-locale navigation bare", () => {
        mocks.data.apps = { ok: true, data: [{ id: "site-1", slug: "academy", customDomain: null, provisionStatus: "awaiting_dns", status: "active" }] }
        render(<AppsSummary />)
        expect(screen.getByText("academy.nivo.vn")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "apps.openSet" }))
        fireEvent.click(screen.getByRole("button", { name: "apps.viewDns" }))
        expect(mocks.push).toHaveBeenCalledWith("/apps")
        expect(mocks.push).toHaveBeenCalledWith("/apps/site-1")
    })

    it("localises routes and settles unknown, empty, and refused answers", () => {
        mocks.locale = "en"
        mocks.data.apps = { ok: true, data: [{ id: "site-2", slug: "sales", customDomain: "sales.example", provisionStatus: "mystery", status: "active" }] }
        const { rerender } = render(<AppsSummary />)
        fireEvent.click(screen.getByRole("button", { name: "apps.open" }))
        expect(mocks.push).toHaveBeenCalledWith("/en/apps/site-2")

        mocks.data.apps = { ok: true, data: [] }
        rerender(<AppsSummary />)
        expect(screen.getByText("apps.emptyDescription")).toBeInTheDocument()

        mocks.data.apps = { ok: false, code: "EXPERT_SITE_NOT_FOUND_EXCEPTION" }
        rerender(<AppsSummary />)
        expect(screen.getByText("refusal.EXPERT_SITE_NOT_FOUND_EXCEPTION")).toBeInTheDocument()
    })
})
