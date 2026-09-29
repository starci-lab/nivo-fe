import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AppsDashboardRestingRows } from "."

describe("AppsDashboardRestingRows", () => {
    it("preserves the requested skeleton row count", () => {
        render(<AppsDashboardRestingRows indexes={[1, 2, 3]} />)
        expect(screen.getAllByRole("link")).toHaveLength(3)
    })
})
