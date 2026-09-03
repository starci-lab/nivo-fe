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

    it("names the DNS action for an app awaiting DNS and counts the row as degraded in the fact", () => {
        mocks.data.apps = { ok: true, data: [{ id: "site-1", slug: "waiting-app", customDomain: null, provisionStatus: "awaiting_dns", status: "active" }] }
        mocks.data.workspaces = { ok: true, data: [] }
        render(<OverviewServices label="Services" />)

        expect(screen.getByRole("button", { name: "apps.viewDns" })).toBeInTheDocument()
        expect(screen.getByText(/overview\.services\.factDegraded:/)).toBeInTheDocument()
    })

    it("opens the one agent workspace row from its own action and names it with no catalog order", () => {
        mocks.data.apps = { ok: true, data: [] }
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-1", name: null, status: "waiting_capacity", catalogOrder: null }] }
        render(<OverviewServices label="Services" />)

        expect(screen.getByText("agentos.kindWorkspace")).toBeInTheDocument()
        expect(screen.getByText("overview.services.workspaceDetailNoOrder")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "overview.services.openWorkspace" }))
        expect(mocks.push).toHaveBeenCalledWith("/agentos/workspaces/workspace-1")
    })

    it("falls back to an unknown status and a neutral tone once the workspace's own status carries no mapped key", () => {
        mocks.data.apps = { ok: true, data: [] }
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-1", name: "reader workspace", status: "reticulating_splines", catalogOrder: null }] }
        render(<OverviewServices label="Services" />)

        expect(screen.getByText("status.unknown")).toBeInTheDocument()
    })

    it("draws no workspace row and names none degraded once the workspace read itself was refused", () => {
        mocks.data.apps = { ok: true, data: [] }
        mocks.data.workspaces = { ok: false, code: "UNKNOWN" }
        render(<OverviewServices label="Services" />)

        expect(screen.queryByRole("button", { name: "overview.services.openWorkspace" })).not.toBeInTheDocument()
        expect(screen.getByText(/overview\.services\.factDegradedNone/)).toBeInTheDocument()
    })
})
