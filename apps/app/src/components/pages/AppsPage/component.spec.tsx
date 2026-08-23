import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/apps/AppsDashboard", () => ({ AppsDashboard: () => <div>apps dashboard</div> }))
import { AppsPageBase } from "./component"

describe("AppsPageBase", () => {
    it("composes the independently connected dashboard block", () => {
        render(<AppsPageBase />)
        expect(screen.getByText("apps dashboard")).toBeInTheDocument()
    })
})
