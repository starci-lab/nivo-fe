import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

type WalletOwnerProbeProps = { readonly pageState: string }

vi.mock("@/components/blocks/wallet/WalletControlCenter", () => ({
    WalletControlCenter: ({ pageState }: WalletOwnerProbeProps) => <div data-owner="wallet-control-center">{pageState}</div>,
}))

import { WalletPageBase } from "./component"

describe("WalletPageBase", () => {
    it("keeps only the Wallet page architecture axis above the connected Wallet block", () => {
        expect(renderToStaticMarkup(<WalletPageBase state="ordinary" />)).toContain("ordinary")
        expect(renderToStaticMarkup(<WalletPageBase state="waypoint" />)).toContain("waypoint")
    })
})