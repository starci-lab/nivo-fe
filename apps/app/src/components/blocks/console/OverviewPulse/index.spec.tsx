import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { vi } from "vitest"

const mocks = vi.hoisted(() => ({
    data: { apps: null, workspaces: null, pod: null, domains: null, wallet: null, invoices: null } as Record<string, unknown>,
}))
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
    useFormatter: () => ({
        number: (value: number) => `money-${value}`,
        dateTime: (value: Date) => `date-${value.toISOString().slice(0, 10)}`,
    }),
}))
vi.mock("@/modules/overview/context", () => ({ useOverviewData: () => mocks.data }))

import { OverviewPulse } from "."

describe("OverviewPulse", () => {
    it("prioritises actionable source facts across all four signals", () => {
        mocks.data.apps = { ok: true, data: [
            { id: "ready", slug: "ready-app", customDomain: null, provisionStatus: "ready", status: "active" },
            { id: "attention", slug: "attention-app", customDomain: null, provisionStatus: "awaiting_dns", status: "active" },
        ] }
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-1", name: "nivo AI Agent", status: "active", catalogOrder: null }] }
        mocks.data.pod = { ok: true, data: { reachable: false, httpStatus: null, tokenConfigured: false, tokenHint: null, checkedAt: "2026-08-23T10:20:00.000Z" } }
        mocks.data.domains = { ok: true, data: [{ id: "domain-1", name: "api.nivo.vn", status: "expiring", expiresAt: "2026-09-12T00:00:00.000Z", autoRenew: false }] }
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 2450000 } }
        mocks.data.invoices = { ok: true, data: [{ id: "invoice-1", amountVnd: 490000, status: "unpaid", dueAt: "2026-08-25T00:00:00.000Z", paidAt: null, catalogOrder: null }] }
        const { container } = render(<OverviewPulse />)
        expect(container).toHaveTextContent("attention-app")
        expect(container).toHaveTextContent("nivo AI Agent")
        expect(container).toHaveTextContent("api.nivo.vn")
        expect(container).toHaveTextContent("money-2450000")
    })

    it("settles empty source collections without inventing resources", () => {
        mocks.data.apps = { ok: true, data: [] }
        mocks.data.workspaces = { ok: true, data: [] }
        mocks.data.pod = { ok: true, data: { reachable: true, httpStatus: 200, tokenConfigured: true, tokenHint: null, checkedAt: "2026-08-23T10:20:00.000Z" } }
        mocks.data.domains = { ok: true, data: [{ id: "domain-1", name: "held.nivo.vn", status: "active", expiresAt: null, autoRenew: true }] }
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 0 } }
        mocks.data.invoices = { ok: true, data: [] }
        const { container } = render(<OverviewPulse />)
        expect(container).toHaveTextContent("overview.none")
        expect(container).toHaveTextContent("domains.autoRenewOn")
        expect(container).toHaveTextContent("wallet.noUnpaid")
    })

    it("keeps named and unknown refusals inside their own cards", () => {
        mocks.data.apps = { ok: false, code: "EXPERT_SITE_NOT_FOUND_EXCEPTION" }
        mocks.data.workspaces = { ok: false, code: "UNKNOWN" }
        mocks.data.pod = { ok: false, code: "POD_REGISTRATION_MISSING_EXCEPTION" }
        mocks.data.domains = { ok: false, code: "UNKNOWN" }
        mocks.data.wallet = { ok: false, code: "UNKNOWN" }
        mocks.data.invoices = { ok: false, code: "UNKNOWN" }
        const { container } = render(<OverviewPulse />)
        expect(container).toHaveTextContent("refusal.EXPERT_SITE_NOT_FOUND_EXCEPTION")
        expect(container).toHaveTextContent("refusal.unknown")
    })

    it("keeps every unsettled answer visibly pending", () => {
        mocks.data.apps = null
        mocks.data.workspaces = null
        mocks.data.pod = null
        mocks.data.domains = null
        mocks.data.wallet = null
        mocks.data.invoices = null
        const { container } = render(<OverviewPulse />)
        expect(container.querySelectorAll('[data-component="Text"][data-tone][data-size="sm"][data-loading="true"][aria-hidden="true"]')).toHaveLength(4)
    })

    it("raises every warning caption out of the healthy tone", () => {
        const inDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString()
        mocks.data.apps = { ok: true, data: [{ id: "site-1", slug: "waiting-app", customDomain: null, provisionStatus: "awaiting_dns", status: "active" }] }
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-1", name: "nivo AI Agent", status: "active", catalogOrder: null }] }
        mocks.data.pod = { ok: true, data: { reachable: false, httpStatus: null, tokenConfigured: true, tokenHint: null, checkedAt: inDays(0) } }
        mocks.data.domains = { ok: true, data: [{ id: "domain-1", name: "api.nivo.vn", status: "active", expiresAt: inDays(21), autoRenew: false }] }
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 2450000 } }
        mocks.data.invoices = { ok: true, data: [{ id: "invoice-1", amountVnd: 490000, status: "unpaid", dueAt: inDays(-2), paidAt: null, catalogOrder: null }] }
        const { container } = render(<OverviewPulse />)

        expect(container.querySelectorAll('[data-component="Badge"][data-tone="warning"]')).toHaveLength(2)
        expect(container.querySelectorAll('[data-component="Badge"][data-tone="danger"]')).toHaveLength(2)
    })

    it("leaves a settled healthy account with no raised caption", () => {
        const inDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString()
        mocks.data.apps = { ok: true, data: [{ id: "site-1", slug: "ready-app", customDomain: null, provisionStatus: "ready", status: "active" }] }
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-1", name: "nivo AI Agent", status: "active", catalogOrder: null }] }
        mocks.data.pod = { ok: true, data: { reachable: true, httpStatus: 200, tokenConfigured: true, tokenHint: null, checkedAt: inDays(0) } }
        mocks.data.domains = { ok: true, data: [{ id: "domain-1", name: "api.nivo.vn", status: "active", expiresAt: inDays(120), autoRenew: true }] }
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 2450000 } }
        mocks.data.invoices = { ok: true, data: [{ id: "invoice-1", amountVnd: 490000, status: "unpaid", dueAt: inDays(9), paidAt: null, catalogOrder: null }] }
        const { container } = render(<OverviewPulse />)

        expect(container.querySelectorAll('[data-component="Badge"]')).toHaveLength(0)
    })

    it("handles unknown lifecycle values and non-renewing held domains", () => {
        mocks.data.apps = { ok: true, data: [{ id: "site-1", slug: "mystery-app", customDomain: null, provisionStatus: "mystery", status: "active" }] }
        mocks.data.workspaces = { ok: true, data: [{ id: "workspace-1", name: null, status: "mystery", catalogOrder: null }] }
        mocks.data.pod = { ok: true, data: { reachable: true, httpStatus: 200, tokenConfigured: true, tokenHint: null, checkedAt: "2026-08-23T10:20:00.000Z" } }
        mocks.data.domains = { ok: true, data: [{ id: "domain-1", name: "held.nivo.vn", status: "active", expiresAt: null, autoRenew: false }] }
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 0 } }
        mocks.data.invoices = { ok: false, code: "UNKNOWN" }
        const { container } = render(<OverviewPulse />)
        expect(container).toHaveTextContent("status.unknown")
        expect(container).toHaveTextContent("agentos.podReachable")
        expect(container).toHaveTextContent("domains.autoRenewOff")
        expect(container).toHaveTextContent("wallet.noUnpaid")
    })
})
