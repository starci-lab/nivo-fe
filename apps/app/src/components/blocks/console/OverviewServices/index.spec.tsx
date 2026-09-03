import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    data: { apps: null, workspaces: null } as Record<string, unknown>,
}))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string, values?: Record<string, unknown>) => values === undefined ? key : `${key}:${JSON.stringify(values)}` }))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/modules/overview/context", () => ({ useOverviewData: () => mocks.data }))

import { OverviewServices } from "."

describe("OverviewServices", () => {
    it("lists every owned app before the one agent workspace", () => {
        mocks.data.apps = { ok: true, data: [
            { id: "site-1", slug: "reader-app", customDomain: null, provisionStatus: "ready", status: "active" },
            { id: "site-2", slug: "second-app", customDomain: "second.example.com", provisionStatus: "active", status: "active" },
        ] }
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-1", name: "reader workspace", status: "active", catalogOrder: { id: "order-1" } }] }
        render(<OverviewServices label="Services" />)

        expect(screen.getByText("reader-app")).toBeInTheDocument()
        expect(screen.getByText("second-app")).toBeInTheDocument()
        expect(screen.getByText("reader workspace")).toBeInTheDocument()
        expect(screen.getByText("overview.services.workspaceDetailWithOrder:{\"orderId\":\"order-1\"}")).toBeInTheDocument()
    })

    it("opens the row's own app from its own action", () => {
        mocks.data.apps = { ok: true, data: [{ id: "site-1", slug: "reader-app", customDomain: null, provisionStatus: "ready", status: "active" }] }
        mocks.data.workspaces = { ok: true, data: [] }
        render(<OverviewServices label="Services" />)

        fireEvent.click(screen.getByRole("button", { name: "apps.open" }))
        expect(mocks.push).toHaveBeenCalledWith("/apps/site-1")
    })

    it("disables an app row that has not been provisioned yet", () => {
        mocks.data.apps = { ok: true, data: [{ id: "site-1", slug: "new-app", customDomain: null, provisionStatus: "not_provisioned", status: "draft" }] }
        mocks.data.workspaces = { ok: true, data: [] }
        render(<OverviewServices label="Services" />)

        expect(screen.getByRole("button", { name: "apps.unavailable" })).toBeDisabled()
    })

    it("keeps the collection loading until both slices settle", () => {
        mocks.data.apps = null
        mocks.data.workspaces = { ok: true, data: [] }
        const { container } = render(<OverviewServices label="Services" />)

        expect(container.querySelectorAll('[data-loading="true"]').length).toBeGreaterThan(0)
    })
})
