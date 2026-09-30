import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/academy/AcademyControlCenter", () => ({
    AcademyControlCenter: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { AcademyControlCenterPage } from "."

describe("AcademyControlCenterPage server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<AcademyControlCenterPage siteId="site-1" />)
        expect(screen.getByTestId("block")).toHaveTextContent("site-1")
    })
})