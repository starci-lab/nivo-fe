import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/console/OverviewPage", () => ({
    OverviewPage: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { OverviewPage } from "."

describe("OverviewPage server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<OverviewPage />)
        expect(screen.getByTestId("block")).toHaveTextContent("{}")
    })
})