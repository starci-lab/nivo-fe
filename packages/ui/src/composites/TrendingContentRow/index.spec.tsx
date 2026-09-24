import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TrendingContentRow } from "./"

describe("TrendingContentRow", () => {
    it("styles a top trending rank and opens its title", () => {
        const open = vi.fn()
        render(<TrendingContentRow props={{ id: "one", rank: "1", title: "Popular", isTopRank: true }} on={{ open }} />)
        expect(screen.getByText("1")).toHaveAttribute("data-tone", "accent")
        fireEvent.click(screen.getByRole("button", { name: "Popular" }))
        expect(open).toHaveBeenCalledTimes(1)
    })
})