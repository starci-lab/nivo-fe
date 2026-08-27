import { act, render, screen, waitFor } from "@testing-library/react"
import { cleanup } from "@testing-library/react"
import { SWRConfig } from "swr"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    api: { createWalletTopUpPayLink: vi.fn(), myInvoices: vi.fn(), myWallet: vi.fn(), myWalletTransactions: vi.fn(), payInvoice: vi.fn() },
    navigation: { pathname: "/en/wallet", search: "" },
    session: { state: { status: "signed-in", accessToken: "token" } },
    t: (key: string, values?: Record<string, unknown>) => values === undefined ? key : `${key}:${JSON.stringify(values)}`,
}))

type WalletProbeProps = {
    state: "ordinary" | "waypoint"
    balance: unknown
    breadcrumb?: unknown
    linkedInvoice?: unknown
    transactions: unknown
    invoices: unknown
    topUp: unknown
    result: unknown
    on?: {
        topUp?: () => void
        closeTopUp?: () => void
        changeTopUpAmount?: (value: string) => void
        submitTopUp?: () => void
        closeResult?: () => void
        payInvoice?: () => void
        openOrder?: () => void
        returnToOrder?: () => void
    }
}

vi.mock("next-intl", () => ({ useLocale: () => "en", useTranslations: () => mocks.t, useFormatter: () => ({ number: (value: number) => `money-${value}`, dateTime: (value: Date) => `date-${value.toISOString().slice(0, 10)}` }) }))
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(mocks.navigation.search) }))
vi.mock("@/i18n/navigation", () => ({ usePathname: () => mocks.navigation.pathname }))
vi.mock("@/modules/auth/session", () => ({ useSession: () => mocks.session }))
vi.mock("@/modules/api/console", () => mocks.api)
vi.mock("./component", () => ({
    WalletControlCenterBase: (props: WalletProbeProps) => (
        <div>
            <output data-testid="wallet">{JSON.stringify({ state: props.state, breadcrumb: props.breadcrumb, balance: props.balance, linkedInvoice: props.linkedInvoice, transactions: props.transactions, invoices: props.invoices, topUp: props.topUp, result: props.result })}</output>
            <button data-testid="pay" onClick={props.on?.payInvoice}>pay</button>
            <button data-testid="open-top-up" onClick={props.on?.topUp}>top-up</button>
            <button data-testid="amount" onClick={() => props.on?.changeTopUpAmount?.("25000")}>amount</button>
            <button data-testid="invalid-amount" onClick={() => props.on?.changeTopUpAmount?.("999")}>invalid-amount</button>
            <button data-testid="submit-top-up" onClick={props.on?.submitTopUp}>submit-top-up</button>
            <button data-testid="close-top-up" onClick={props.on?.closeTopUp}>close-top-up</button>
            <button data-testid="close-result" onClick={props.on?.closeResult}>close-result</button>
            <button data-testid="open-order" onClick={props.on?.openOrder}>open-order</button>
            <button data-testid="return-order" onClick={props.on?.returnToOrder}>return-order</button>
        </div>
    ),
}))

import { WalletControlCenter } from "./"

const output = () => screen.getByTestId("wallet").textContent ?? ""
const renderWallet = () => render(<WalletControlCenter pageState={mocks.navigation.search === "" ? "ordinary" : "waypoint"} />)
const resetQueryCache = () => { for (const key of SWRConfig.defaultValue.cache.keys()) SWRConfig.defaultValue.cache.delete(key) }

describe("WalletControlCenter connected states", () => {
    afterEach(() => cleanup())
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.navigation.pathname = "/en/wallet"
        mocks.navigation.search = ""
        mocks.session.state = { status: "signed-in", accessToken: "token" }
        mocks.api.myWallet.mockResolvedValue({ ok: true, data: { balanceVnd: 0 } })
        mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [] })
        mocks.api.myWalletTransactions.mockResolvedValue({ ok: true, data: [] })
        mocks.api.payInvoice.mockResolvedValue({ ok: true })
        mocks.api.createWalletTopUpPayLink.mockResolvedValue({ ok: false, reason: "gateway-unconfigured" })
    })

    it("keeps an unsettled session resting and does not query", () => {
        mocks.session.state = { status: "restoring", accessToken: "" }
        renderWallet()
        expect(output()).toContain('"state":"ordinary"')
        expect(output()).not.toContain("linkedInvoice")
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
        renderWallet()
        await waitFor(() => expect(output()).toContain("Academy · Pro"))
        expect(output()).toContain("money-1250")
        await act(async () => { screen.getByTestId("pay").click() })
        await waitFor(() => expect(mocks.api.payInvoice).toHaveBeenCalledWith("invoice"))
    })

    it("keeps refusal, empty ledgers, and payment failure local to their sections", async () => {
        mocks.api.myWallet.mockResolvedValue({ ok: false, code: "wallet-down" })
        mocks.api.myInvoices.mockResolvedValue({ ok: false, code: "invoice-down" })
        mocks.api.myWalletTransactions.mockResolvedValue({ ok: false, code: "movement-down" })
        renderWallet()
        await waitFor(() => expect(output()).toContain('"phase":"refused"'))

        cleanup()
        resetQueryCache()
        mocks.api.myWallet.mockResolvedValue({ ok: true, data: { balanceVnd: 100 } })
        mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [{ id: "invoice", amountVnd: 100, status: "unpaid", dueAt: "2026-08-20T00:00:00.000Z", catalogOrder: null }] })
        mocks.api.myWalletTransactions.mockResolvedValue({ ok: true, data: [{ id: "movement", amountVnd: 100, type: "spend", createdAt: "2026-08-20T00:00:00.000Z" }] })
        mocks.api.payInvoice.mockResolvedValue({ ok: false, reason: "payment-failed" })
        renderWallet()
        await waitFor(() => expect(output()).toContain("wallet.transactionsLabel"))
        await act(async () => { screen.getByTestId("pay").click() })
        await waitFor(() => expect(mocks.api.payInvoice).toHaveBeenCalledWith("invoice"))
    })

    it("opens top-up and keeps a gateway refusal inside that flow", async () => {
        renderWallet()
        await waitFor(() => expect(output()).toContain("money-0"))
        await act(async () => { screen.getByTestId("open-top-up").click() })
        expect(output()).toContain('"overlayState":"open"')
        await act(async () => { screen.getByTestId("amount").click() })
        await act(async () => { screen.getByTestId("submit-top-up").click() })
        await waitFor(() => expect(mocks.api.createWalletTopUpPayLink).toHaveBeenCalledWith(
            25000,
            "http://localhost:3000/en/wallet/top-up/return",
            "http://localhost:3000/en/wallet/top-up/return?status=cancelled",
        ))
        await waitFor(() => expect(output()).toContain("gateway-unconfigured"))
        await act(async () => { screen.getByTestId("close-top-up").click() })
        expect(output()).toContain('"overlayState":"closed"')
    })

    it("refuses an invalid top-up before requesting checkout", async () => {
        renderWallet()
        await waitFor(() => expect(output()).toContain("money-0"))
        await act(async () => { screen.getByTestId("invalid-amount").click() })
        await act(async () => { screen.getByTestId("submit-top-up").click() })

        expect(mocks.api.createWalletTopUpPayLink).not.toHaveBeenCalled()
        expect(output()).toContain("wallet.topUpInvalid")
    })

    it("submits a safe checkout form and retains its exact evidence", async () => {
        const submit = vi.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(() => undefined)
        mocks.api.createWalletTopUpPayLink.mockResolvedValue({
            ok: true,
            data: {
                checkoutUrl: "https://pay.example/checkout",
                checkoutFields: JSON.stringify({ reference: "ref-42" }),
                referenceId: "ref-42",
                chargedAmountVnd: 25000,
            },
        })
        renderWallet()
        await waitFor(() => expect(output()).toContain("money-0"))
        await act(async () => { screen.getByTestId("amount").click() })
        await act(async () => { screen.getByTestId("submit-top-up").click() })

        await waitFor(() => expect(output()).toContain("ref-42"))
        expect(document.querySelector("form[action='https://pay.example/checkout'] input[name='reference']")).toHaveValue("ref-42")
        expect(submit).toHaveBeenCalledTimes(1)
        submit.mockRestore()
    })

    it("correlates a complete page waypoint to the exact invoice and order", async () => {
        mocks.navigation.search = "orderId=order-42&invoiceId=invoice-42&returnTo=%2Fen%2Fagentos%2Forders%2Forder-42"
        mocks.api.myWallet.mockResolvedValue({ ok: true, data: { balanceVnd: 500 } })
        mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [{
            id: "invoice-42", amountVnd: 500, status: "unpaid", dueAt: "2026-08-20T00:00:00.000Z", paidAt: null,
            catalogOrder: { id: "order-42", catalogItem: { name: "AgentOS" }, catalogTier: { name: "Growth" } },
        }] })

        renderWallet()
        await waitFor(() => expect(output()).toContain('"phase":"answered"'))
        expect(output()).toContain('"state":"waypoint"')
        expect(output()).toContain('"backLabel":"wallet.returnToOrder"')
        expect(output()).toContain('"actionKind":"pay"')
        expect(output()).toContain("order-42")
        expect(output()).toContain('"rows":[]')
    })

    it("keeps an incomplete continuation in waypoint architecture with a local refusal", () => {
        mocks.navigation.search = "orderId=order-42"
        mocks.session.state = { status: "restoring", accessToken: "" }
        renderWallet()
        expect(output()).toContain('"state":"waypoint"')
        expect(output()).toContain('"linkedInvoice":{"phase":"refused"')
        expect(output()).toContain("wallet.invalidContinuation")
    })

    it("marks an underfunded correlated invoice without exposing a pay action", async () => {
        mocks.navigation.search = "orderId=order-42&invoiceId=invoice-42&returnTo=%2Fen%2Fagentos%2Forders%2Forder-42"
        mocks.api.myWallet.mockResolvedValue({ ok: true, data: { balanceVnd: 100 } })
        mocks.api.myInvoices.mockResolvedValue({ ok: true, data: [{
            id: "invoice-42", amountVnd: 500, status: "unpaid", dueAt: "2026-08-20T00:00:00.000Z",
            catalogOrder: { id: "order-42", catalogItem: { name: "AgentOS" }, catalogTier: null },
        }] })
        renderWallet()

        await waitFor(() => expect(output()).toContain("wallet.insufficientBalance"))
        expect(output()).toContain('"actionDisabled":true')
    })
})
