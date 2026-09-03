import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    data: { apps: null, workspaces: null, domains: null } as { apps: unknown, workspaces: unknown, domains: unknown },
}))
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
    useFormatter: () => ({ dateTime: (value: Date) => `date-${value.toISOString().slice(0, 10)}` }),
}))
vi.mock("@/modules/overview/context", () => ({ useOverviewData: () => mocks.data }))

import { InfrastructureSummary } from "."

describe("InfrastructureSummary", () => {
    beforeEach(() => {
        mocks.data.apps = null
        mocks.data.workspaces = null
        mocks.data.domains = null
    })

    it("maps held domains into status and renewal facts", () => {
        mocks.data.apps = { ok: true, data: [{ id: "site-1", slug: "academy", customDomain: null, provisionStatus: "ready", status: "active" }] }
        mocks.data.workspaces = { ok: true, data: [] }
        mocks.data.domains = { ok: true, data: [{ id: "domain-1", name: "api.nivo.vn", status: "active", expiresAt: "2026-09-12T00:00:00.000Z", autoRenew: false }] }
        render(<InfrastructureSummary />)

        expect(screen.getByText("api.nivo.vn")).toBeInTheDocument()
        expect(screen.getByText(/domains\.status\.active/)).toBeInTheDocument()
        expect(screen.getByText(/domains\.expiresAt/)).toBeInTheDocument()
    })

    it("names the account as empty only once both service answers settled", () => {
        mocks.data.apps = { ok: true, data: [] }
        mocks.data.workspaces = { ok: true, data: [] }
        mocks.data.domains = { ok: true, data: [] }
        render(<InfrastructureSummary />)

        expect(screen.getByText(/infrastructure\.empty/)).toBeInTheDocument()
        expect(screen.getByText(/domains\.empty/)).toBeInTheDocument()
    })

    it("keeps a domain refusal partial while a built service still exists", () => {
        mocks.data.apps = { ok: true, data: [{ id: "site-1", slug: "academy", customDomain: null, provisionStatus: "ready", status: "active" }] }
        mocks.data.workspaces = { ok: true, data: [] }
        mocks.data.domains = { ok: false, code: "UNKNOWN" }
        render(<InfrastructureSummary />)

        expect(screen.getByText(/refusal\.unknown/)).toBeInTheDocument()
    })

    it("fails outright when no built service explains the missing domains", () => {
        mocks.data.apps = { ok: true, data: [] }
        mocks.data.workspaces = { ok: true, data: [] }
        mocks.data.domains = { ok: false, code: "UNKNOWN" }
        render(<InfrastructureSummary />)

        expect(screen.getByText(/refusal\.unknown/)).toBeInTheDocument()
    })

    it("keeps an unsettled domain answer pending", () => {
        render(<InfrastructureSummary />)

        expect(screen.getByText("infrastructure.title")).toBeInTheDocument()
    })
})
