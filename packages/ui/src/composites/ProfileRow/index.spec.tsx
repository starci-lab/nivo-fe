import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ProfileRow } from "./"

describe("ProfileRow", () => {
    it("presses a profile row with its accessible name", () => {
        const press = vi.fn()
        render(<ProfileRow props={{ displayName: "Ada", username: "ada" }} on={{ press }} />)
        fireEvent.click(screen.getByRole("button", { name: "Ada" }))
        expect(press).toHaveBeenCalledTimes(1)
    })
})