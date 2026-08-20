import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { WalletSummary } from "./index"

describe("WalletSummary", () => {
    it("draws already-formatted balance and invoice facts", () => {
        const html = renderToStaticMarkup(<WalletSummary label="Wallet" actionLabel="Open wallet" state={{ phase: "populated", facts: [
            { id: "balance", label: "Balance", value: "$12.00" },
            { id: "invoice", label: "Unpaid invoice", value: "$4.00" },
        ] }} onOpenWallet={vi.fn()} />)
        expect(html).toContain("$12.00")
        expect(html).toContain("$4.00")
        expect(html).toContain("Open wallet")
    })

    it("draws a refusal without inventing money facts", () => {
        const html = renderToStaticMarkup(<WalletSummary label="Wallet" state={{ phase: "failed", note: "Wallet unavailable" }} />)
        expect(html).toContain("Wallet unavailable")
        expect(html).not.toContain("$0")
    })
})
