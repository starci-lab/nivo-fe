import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    data: { wallet: null, invoices: null } as Record<string, unknown>,
}))
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, values?: Record<string, unknown>) => values === undefined ? key : `${key}:${JSON.stringify(values)}`,
    useFormatter: () => ({
        number: (value: number) => `money-${value}`,
        dateTime: (value: Date) => `date-${value.toISOString().slice(0, 10)}`,
    }),
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/modules/overview/context", () => ({ useOverviewData: () => mocks.data }))

import { OverviewAccount } from "."

describe("OverviewAccount", () => {
    it("names the exact balance and the one unpaid invoice that owes the next step", () => {
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 150000 } }
        mocks.data.invoices = { ok: true, data: [{ id: "abcdef1234", amountVnd: 120000, status: "unpaid", dueAt: "2026-09-06T00:00:00.000Z", paidAt: null, catalogOrder: null }] }
        render(<OverviewAccount label="Account" />)

        expect(screen.getByText("money-150000")).toBeInTheDocument()
        expect(screen.getByText("overview.account.invoiceName:{\"id\":\"ABCDEF12\"}")).toBeInTheDocument()
    })

    it("routes the invoice row's own top-up command", () => {
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 150000 } }
        mocks.data.invoices = { ok: true, data: [{ id: "abcdef1234", amountVnd: 120000, status: "unpaid", dueAt: "2026-09-06T00:00:00.000Z", paidAt: null, catalogOrder: null }] }
        render(<OverviewAccount label="Account" />)

        fireEvent.click(screen.getByRole("button", { name: "overview.account.topUpWallet" }))
        expect(mocks.push).toHaveBeenCalledWith("/wallet/top-up")
    })

    it("marks unavailable when the wallet read itself was refused", () => {
        mocks.data.wallet = { ok: false, code: "UNKNOWN" }
        mocks.data.invoices = { ok: true, data: [] }
        const { container } = render(<OverviewAccount label="Account" />)

        expect(container.querySelector('[data-grammar-state="unavailable"]')).toBeInTheDocument()
    })

    it("draws no invoice row when nothing is unpaid", () => {
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 0 } }
        mocks.data.invoices = { ok: true, data: [] }
        render(<OverviewAccount label="Account" />)

        expect(screen.queryByRole("button", { name: "overview.account.topUpWallet" })).not.toBeInTheDocument()
    })

    it("keeps the surface loading until both slices settle", () => {
        mocks.data.wallet = null
        mocks.data.invoices = null
        const { container } = render(<OverviewAccount label="Account" />)

        expect(container.querySelectorAll('[data-loading="true"]').length).toBeGreaterThan(0)
    })
})
