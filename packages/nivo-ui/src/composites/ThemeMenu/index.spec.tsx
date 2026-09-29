import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { THEME_MODES, ThemeMenu } from "."

const OPTIONS = [
    { id: "system", label: "System" },
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
] as const

describe("ThemeMenu", () => {
    afterEach(cleanup)

    it("offers system, light and dark, in that order", () => {
        expect(THEME_MODES).toEqual(["system", "light", "dark"])
    })

    it("names its trigger and reports the mode a person picks", async () => {
        const select = vi.fn()
        render(<ThemeMenu props={{ label: "Theme", mode: "system", isDark: false, options: OPTIONS }} on={{ select }} />)

        fireEvent.click(screen.getByRole("button", { name: "Theme" }))
        fireEvent.click(await screen.findByRole("menuitemradio", { name: "Dark" }))
        expect(select).toHaveBeenCalledWith("dark")
    })

    it("marks the chosen mode, not the mode the device resolved to", async () => {
        render(<ThemeMenu props={{ label: "Theme", mode: "system", isDark: true, options: OPTIONS }} />)

        fireEvent.click(screen.getByRole("button", { name: "Theme" }))
        expect(await screen.findByRole("menuitemradio", { name: "System" })).toHaveAttribute("aria-checked", "true")
        expect(screen.getByRole("menuitemradio", { name: "Dark" })).toHaveAttribute("aria-checked", "false")
    })
})
