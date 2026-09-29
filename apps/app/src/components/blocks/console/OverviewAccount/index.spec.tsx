import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    push: vi.fn(),
    data: { wallet: null, invoices: null } as Record<string, unknown>,
}))
vi.mock("@/hooks", () => ({ useRouter: () => ({ push: mocks.push }), useOverviewData: () => mocks.data }))

import { OverviewAccount } from "."

describe("OverviewAccount", () => {
    it("names the exact balance and the one unpaid invoice that owes the next step", () => {
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 150000 } }
        mocks.data.invoices = {
            ok: true,
            data: [
                {
                    id: "abcdef1234",
                    amountVnd: 120000,
                    status: "unpaid",
                    dueAt: "2026-09-06T00:00:00.000Z",
                    paidAt: null,
                    catalogOrder: null,
                },
            ],
        }
        render(<OverviewAccount label="Account" />)

        expect(screen.getByText("₫150,000")).toBeInTheDocument()
        expect(screen.getByText("Invoice ABCDEF12")).toBeInTheDocument()
    })

    it("routes the invoice row's own top-up command", () => {
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 150000 } }
        mocks.data.invoices = {
            ok: true,
            data: [
                {
                    id: "abcdef1234",
                    amountVnd: 120000,
                    status: "unpaid",
                    dueAt: "2026-09-06T00:00:00.000Z",
                    paidAt: null,
                    catalogOrder: null,
                },
            ],
        }
        render(<OverviewAccount label="Account" />)

        fireEvent.click(screen.getByRole("button", { name: "Top up wallet" }))
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

        expect(screen.queryByRole("button", { name: "Top up wallet" })).not.toBeInTheDocument()
    })

    it("keeps the surface loading until both slices settle", () => {
        mocks.data.wallet = null
        mocks.data.invoices = null
        const { container } = render(<OverviewAccount label="Account" />)

        expect(container.querySelectorAll('[data-loading="true"]').length).toBeGreaterThan(0)
    })

    it("routes the label row's own transactions command once settled", () => {
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 150000 } }
        mocks.data.invoices = { ok: true, data: [] }
        render(<OverviewAccount label="Account" />)

        fireEvent.click(screen.getByRole("button", { name: "See transactions" }))
        expect(mocks.push).toHaveBeenCalledWith("/wallet")
    })

    it("names the invoice as overdue once its due date already lies behind the current instant", () => {
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 150000 } }
        mocks.data.invoices = {
            ok: true,
            data: [
                {
                    id: "abcdef1234",
                    amountVnd: 120000,
                    status: "unpaid",
                    dueAt: "2020-01-01T00:00:00.000Z",
                    paidAt: null,
                    catalogOrder: null,
                },
            ],
        }
        const { container } = render(<OverviewAccount label="Account" />)

        expect(screen.getByText("Overdue")).toBeInTheDocument()
        expect(container.querySelector('[data-component="Badge"][data-tone="danger"]')).toBeInTheDocument()
    })

    it("marks the account cautionary and names the count as unknown when the invoice read itself was refused", () => {
        mocks.data.wallet = { ok: true, data: { id: "wallet-1", balanceVnd: 150000 } }
        mocks.data.invoices = { ok: false, code: "UNKNOWN" }
        const { container } = render(<OverviewAccount label="Account" />)

        expect(container.querySelector('[data-grammar-state="cautionary"]')).toBeInTheDocument()
        expect(
            screen.getByText("This part could not be read. The rest of the screen is still correct."),
        ).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Top up wallet" })).not.toBeInTheDocument()
    })

    it("carries the skeleton row's own no-op top-up command while unresolved", () => {
        mocks.data.wallet = null
        mocks.data.invoices = null
        const callsBefore = mocks.push.mock.calls.length
        render(<OverviewAccount label="Account" />)

        const [pendingAction] = screen.getAllByRole("button", { name: "" })
        expect(() => fireEvent.click(pendingAction!)).not.toThrow()
        expect(mocks.push.mock.calls.length).toBe(callsBefore)
    })
})
