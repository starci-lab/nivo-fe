import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { RouteLoadingView } from "./"

describe("RouteLoadingView", () => {
    it("announces what is loading and marks the region busy", () => {
        const { container } = render(<RouteLoadingView props={{ label: "Loading the page" }} />)
        expect(screen.getByRole("status")).toBeInTheDocument()
        expect(container.querySelector("[aria-busy='true']")).not.toBeNull()
    })
})
