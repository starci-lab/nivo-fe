import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ThemeSwitch } from "./"

describe("ThemeSwitch", () => {
    it("reports theme changes from its selected state", () => {
        const change = vi.fn()
        render(<ThemeSwitch props={{ isDark: false, label: "Theme" }} on={{ change }} />)
        const control = screen.getByRole("switch", { name: "Theme" })
        expect(control).not.toBeChecked()
        fireEvent.click(control)
        expect(change).toHaveBeenCalledWith(true)
    })
})
