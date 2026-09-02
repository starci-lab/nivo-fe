import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Label } from "./Label"
import { PressableInputLike } from "./PressableInputLike"
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

    it("renders the optional shortcut and reports presses", () => {
        const press = vi.fn()
        render(<PressableInputLike props={{ label: "Open search", placeholder: "Find anything", shortcut: "⌘K" }} on={{ press }} />)
        expect(screen.getByRole("button", { name: "Open search" })).toBeInTheDocument()
        expect(screen.getByText("Find anything")).toBeInTheDocument()
        expect(screen.getByText("⌘K")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Open search" }))
        expect(press).toHaveBeenCalledTimes(1)
    })
})
