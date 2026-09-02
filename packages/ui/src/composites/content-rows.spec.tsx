import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SuggestedUserRow } from "./SuggestedUserRow"
import { TrendingContentRow } from "./TrendingContentRow"

describe("content rows", () => {
    it("styles a top trending rank and opens its title", () => {
        const open = vi.fn()
        render(<TrendingContentRow props={{ id: "one", rank: "1", title: "Popular", isTopRank: true }} on={{ open }} />)
        expect(screen.getByText("1")).toHaveAttribute("data-tone", "accent")
        fireEvent.click(screen.getByRole("button", { name: "Popular" }))
        expect(open).toHaveBeenCalledTimes(1)
    })

    it("shows an optional work badge and follows a user", () => {
        const open = vi.fn()
        const follow = vi.fn()
        render(<SuggestedUserRow props={{ id: "u1", name: "Ada", username: "ada", openToWork: true, openToWorkLabel: "Open to work", followLabel: "Follow", followingLabel: "Following" }} on={{ open, follow }} />)
        expect(screen.getByText("Open to work")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Ada" }))
        fireEvent.click(screen.getByRole("button", { name: "Follow" }))
        expect(open).toHaveBeenCalledTimes(1)
        expect(follow).toHaveBeenCalledTimes(1)
    })

    it("changes the action label and removes follow behavior when already following", () => {
        const follow = vi.fn()
        render(<SuggestedUserRow props={{ id: "u1", name: "Ada", followLabel: "Follow", followingLabel: "Following", isFollowing: true }} on={{ follow }} />)
        const button = screen.getByRole("button", { name: "Following" })
        fireEvent.click(button)
        expect(follow).not.toHaveBeenCalled()
    })
})
