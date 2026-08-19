import { act, render, screen, waitFor } from "@testing-library/react"
import { cleanup } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    api: { myInvoices: vi.fn(), myWallet: vi.fn(), myWalletTransactions: vi.fn(), payInvoice: vi.fn() },
    session: { state: { status: "signed-in", accessToken: "token" } },
    t: (key: string, values?: Record<string, unknown>) => values === undefined ? key : `${key}:${JSON.stringify(values)}`,
}))

type WalletProbeProps = {
    balance: unknown
    transactions: unknown
    invoices: unknown
    on?: { payInvoice?: () => void }
}

vi.mock("next-intl", () => ({ useTranslations: () => mocks.t, useFormatter: () => ({ number: (value: number) => `money-${value}`, dateTime: (value: Date) => `date-${value.toISOString().slice(0, 10)}` }) }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/console", () => mocks.api)
vi.mock("./component", () => ({
    WalletPageBase: (props: WalletProbeProps) => (
        <div>
            <output data-testid="wallet">{JSON.stringify({ balance: props.balance, transactions: props.transactions, invoices: props.invoices })}</output>
            <button data-testid="pay" onClick={props.on?.payInvoice}>pay</button>
        </div>
    ),
}))

import { WalletPage } from "./"

const output = () => screen.getByTestId("wallet").textContent ?? ""

describe("WalletPage connected states", () => {
    afterEach(() => cleanup())
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        mocks.api.myWallet.mockResolvedValue({ ok: true, data: { balanceVnd: 0 } })
        mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [] })
        mocks.api.myWalletTransactions.mockResolvedValue({ ok: true, data: [] })
        mocks.api.payInvoice.mockResolvedValue({ ok: true })
    })

    it("keeps an unsettled session resting and does not query", () => {
        mocks.session.state = { status: "restoring", accessToken: "" }
        render(<WalletPage />)
        expect(output()).toContain('"phase":"resting"')
        expect(mocks.api.myWallet).not.toHaveBeenCalled()
    })

    it("formats answered balance, unpaid invoice, movements, and a successful payment", async () => {
        mocks.api.myWallet.mockResolvedValue({ ok: true, data: { balanceVnd: 1250 } })
        mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [
            { id: "invoice", amountVnd: 500, status: "unpaid", dueAt: "2026-08-20T00:00:00.000Z", catalogOrder: { catalogItem: { name: "Academy" }, catalogTier: { name: "Pro" } } },
            { id: "legacy", amountVnd: 100, status: "paid", dueAt: "2026-08-20T00:00:00.000Z", catalogOrder: { catalogItem: { name: "Legacy" }, catalogTier: null } },
        ] })
        mocks.api.myWalletTransactions.mockResolvedValue({ ok: true, data: [{ id: "movement", amountVnd: 1250, type: "deposit", createdAt: "2026-08-20T00:00:00.000Z" }] })
        render(<WalletPage />)
        await waitFor(() => expect(output()).toContain("Academy · Pro"))
        expect(output()).toContain("money-1250")
        await act(async () => { screen.getByTestId("pay").click() })
        await waitFor(() => expect(mocks.api.payInvoice).toHaveBeenCalledWith("invoice"))
    })

    it("keeps refusal, empty ledgers, and payment failure local to their sections", async () => {
        mocks.api.myWallet.mockResolvedValue({ ok: false, code: "wallet-down" })
        mocks.api.myInvoices.mockResolvedValue({ ok: false, code: "invoice-down" })
        mocks.api.myWalletTransactions.mockResolvedValue({ ok: false, code: "movement-down" })
        render(<WalletPage />)
        await waitFor(() => expect(output()).toContain('"phase":"refused"'))

        cleanup()
        mocks.api.myWallet.mockResolvedValue({ ok: true, data: { balanceVnd: 100 } })
        mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [{ id: "invoice", amountVnd: 100, status: "unpaid", dueAt: "2026-08-20T00:00:00.000Z", catalogOrder: null }] })
        mocks.api.myWalletTransactions.mockResolvedValue({ ok: true, data: [{ id: "movement", amountVnd: 100, type: "spend", createdAt: "2026-08-20T00:00:00.000Z" }] })
        mocks.api.payInvoice.mockResolvedValue({ ok: false, reason: "payment-failed" })
        render(<WalletPage />)
        await waitFor(() => expect(output()).toContain("wallet.transactionsLabel"))
        await act(async () => { screen.getByTestId("pay").click() })
        await waitFor(() => expect(mocks.api.payInvoice).toHaveBeenCalledWith("invoice"))
    })
})
