import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("./component", () => ({ AppsPageBase: () => <div>apps page</div> }))
import { AppsPage } from "."

describe("AppsPage", () => {
    it("mounts the dashboard compositor", () => {
        render(<AppsPage />)
        expect(screen.getByText("apps page")).toBeInTheDocument()
    })
})