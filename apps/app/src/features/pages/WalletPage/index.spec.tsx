import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/wallet/WalletControlCenter", () => ({
    WalletControlCenter: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { WalletPage } from "."

describe("WalletPage server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<WalletPage />)
        expect(screen.getByTestId("block")).toHaveTextContent("{}")
    })
})