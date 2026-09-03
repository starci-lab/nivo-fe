import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PressableField } from "@starci/grammar/common"
import { Label } from "./Label"
import { ThemeSwitch } from "./ThemeSwitch"

describe("typography leaves", () => {
    it("associates labels and optional icons with controls", () => {
        render(<><Label props={{ htmlFor: "email", content: "Email", icon: "email" }} /><input id="email" /></>)
        expect(screen.getByText("Email")).toHaveAttribute("for", "email")
        expect(document.querySelector("label svg")).toBeInTheDocument()
    })
})

describe("theme and pressable input controls", () => {
    it("reports theme changes from its selected state", () => {
        const change = vi.fn()
        render(<ThemeSwitch props={{ isDark: false, label: "Theme" }} on={{ change }} />)
        const control = screen.getByRole("switch", { name: "Theme" })
        expect(control).not.toBeChecked()
        fireEvent.click(control)
        expect(change).toHaveBeenCalledWith(true)
    })

    it("reports presses from the grammar's pressable field by its accessible name", () => {
        const press = vi.fn()
        render(<PressableField label="Open search" placeholder="Find anything" shortcut="⌘K" onPress={press} />)
        const control = screen.getByRole("button", { name: "Open search" })
        expect(control).toBeInTheDocument()
        fireEvent.click(control)
        expect(press).toHaveBeenCalledTimes(1)
    })
})
