import type { useTranslations } from "next-intl"
import { describe, expect, it } from "vitest"
import { createWalletOverlayViews } from "./overlay-views"

const t: ReturnType<typeof useTranslations<"console">> = Object.assign(
    <Key extends string>(key: Key, ...values: Array<unknown>) => {
        void values
        return key
    },
    {
        rich: <Key extends string>(key: Key, ...values: Array<unknown>) => {
            void values
            return key
        },
        markup: <Key extends string>(key: Key, ...values: Array<unknown>) => {
            void values
            return key
        },
        raw: <Key extends string>(key: Key) => key,
        has: <Key extends string>(key: Key) => key.length >= 0,
    },
)

describe("createWalletOverlayViews", () => {
    it("keeps provider return pending until the balance includes the exact top-up", () => {
        const views = createWalletOverlayViews({
            t,
            isReturn: true,
            isCancelled: false,
            stored: { amountVnd: 25000, startingBalanceVnd: 50000, referenceId: "REF-1" },
            walletAnswer: { ok: true, data: { id: "wallet-1", balanceVnd: 70000 } },
            amount: (value) => `${value} VND`,
            topUpOpen: false,
            topUpAmount: "",
            topUpPending: false,
            topUpError: undefined,
            checkout: undefined,
        })

        expect(views.result).toMatchObject({ overlayState: "open", state: "wallet.resultPending", tone: "warning" })
    })
})
