import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/auth/AuthenticationPage", () => ({
    AuthenticationPage: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { AuthenticationPage } from "."

describe("AuthenticationPage server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<AuthenticationPage />)
        expect(screen.getByTestId("block")).toHaveTextContent("{}")
    })
})