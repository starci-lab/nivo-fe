import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    data: { domains: null } as Record<string, unknown>,
}))
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => values === undefined ? key : `${key}:${JSON.stringify(values)}`,
    useFormatter: () => ({ dateTime: (value: Date) => `date-${value.toISOString().slice(0, 10)}` }),
}))
vi.mock("@/modules/overview/context", () => ({ useOverviewData: () => mocks.data }))

import { OverviewAddresses } from "."

describe("OverviewAddresses", () => {
    it("names every held domain and its own renewal state", () => {
        mocks.data.domains = { ok: true, data: [{ id: "domain-1", name: "api.nivo.vn", status: "active", expiresAt: null, autoRenew: true }] }
        render(<OverviewAddresses />)

        expect(screen.getByText("api.nivo.vn")).toBeInTheDocument()
        expect(screen.getByText("domains.status.active · domains.autoRenewOn")).toBeInTheDocument()
    })

    it("states its own absence when there are no domains held", () => {
        mocks.data.domains = { ok: true, data: [] }
        render(<OverviewAddresses />)

        expect(screen.getByText("domains.empty")).toBeInTheDocument()
    })

    it("names the refusal when the domain read itself was refused", () => {
        mocks.data.domains = { ok: false, code: "UNKNOWN" }
        render(<OverviewAddresses />)

        expect(screen.getByText("refusal.unknown")).toBeInTheDocument()
    })

    it("keeps the surface loading until the domain read settles", () => {
        mocks.data.domains = null
        const { container } = render(<OverviewAddresses />)

        expect(container.querySelectorAll('[data-loading="true"]').length).toBeGreaterThan(0)
    })

    it("names the exact expiry date once a domain carries one, over the auto-renew reading", () => {
        mocks.data.domains = { ok: true, data: [{ id: "domain-1", name: "expiring.nivo.vn", status: "expiring", expiresAt: "2026-09-30T00:00:00.000Z", autoRenew: true }] }
        render(<OverviewAddresses />)

        expect(screen.getByText("domains.status.expiring · domains.expiresAt:{\"date\":\"date-2026-09-30\"}")).toBeInTheDocument()
    })

    it("reads auto-renew as off when a domain carries no expiry and is not set to renew", () => {
        mocks.data.domains = { ok: true, data: [{ id: "domain-1", name: "manual.nivo.vn", status: "active", expiresAt: null, autoRenew: false }] }
        render(<OverviewAddresses />)

        expect(screen.getByText("domains.status.active · domains.autoRenewOff")).toBeInTheDocument()
    })
})
