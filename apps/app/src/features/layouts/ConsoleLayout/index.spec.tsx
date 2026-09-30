import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/console/ConsoleLayout", () => ({
    ConsoleLayout: (props: Record<string, unknown>) => <output data-testid="block">{JSON.stringify(props)}</output>,
}))

import { ConsoleLayout } from "."

describe("ConsoleLayout server composition", () => {
    it("passes route input into its interactive block", () => {
        render(<ConsoleLayout><span>route content</span></ConsoleLayout>)
        expect(screen.getByTestId("block")).toHaveTextContent("route content")
    })
})