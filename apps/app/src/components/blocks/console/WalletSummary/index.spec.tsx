import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    data: { wallet: null, invoices: null } as { wallet: unknown, invoices: unknown },
    locale: "vi",
    push: vi.fn(),
}))
vi.mock("next-intl", () => ({
    useLocale: () => mocks.locale,
    useTranslations: () => (key: string) => key,
    useFormatter: () => ({
        number: (value: number) => `money-${value}`,
        dateTime: (value: Date) => `date-${value.toISOString().slice(0, 10)}`,
    }),
}))
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }))
vi.mock("@/modules/overview/context", () => ({ useOverviewData: () => mocks.data }))

import { WalletSummary } from "."

describe("WalletSummary", () => {
    beforeEach(() => {
        mocks.locale = "vi"
        mocks.push.mockClear()
        mocks.data.wallet = null
        mocks.data.invoices = null
    })

    it("joins balance and unpaid invoice and routes both actions", () => {
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 2450000 } }
        mocks.data.invoices = { ok: true, data: [{ id: "invoice-abcdef12", amountVnd: 490000, status: "unpaid", dueAt: "2026-08-25T00:00:00.000Z", paidAt: null, catalogOrder: null }] }
        render(<WalletSummary />)
        expect(screen.getByText("money-2450000")).toBeInTheDocument()
        expect(screen.getByText(/money-490000/)).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "wallet.viewTransactions" }))
        fireEvent.click(screen.getByRole("button", { name: "wallet.topUp" }))
        expect(mocks.push).toHaveBeenNthCalledWith(1, "/wallet")
        expect(mocks.push).toHaveBeenNthCalledWith(2, "/wallet/top-up")
    })

    it("settles zero, partial, and failed wallet answers", () => {
        mocks.locale = "en"
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 0 } }
        mocks.data.invoices = { ok: true, data: [] }
        const { rerender } = render(<WalletSummary />)
        fireEvent.click(screen.getByRole("button", { name: "wallet.viewTransactions" }))
        expect(mocks.push).toHaveBeenCalledWith("/wallet")

        mocks.data.invoices = { ok: false, code: "UNKNOWN" }
        rerender(<WalletSummary />)
        expect(screen.getByText("refusal.unknown")).toBeInTheDocument()

        mocks.data.wallet = { ok: false, code: "UNKNOWN" }
        rerender(<WalletSummary />)
        expect(screen.getByText("refusal.unknown")).toBeInTheDocument()
    })
})
