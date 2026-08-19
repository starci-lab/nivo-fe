import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SeeMoreLink } from "./"

describe("SeeMoreLink extra states", () => {
    it("reports its follow action and tolerates an absent label", () => {
        const press = vi.fn()
        render(<SeeMoreLink props={{}} on={{ press }} />)
        const link = screen.getByRole("link")
        fireEvent.click(link)
        expect(press).toHaveBeenCalledTimes(1)
    })
})
