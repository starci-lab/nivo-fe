import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Heading } from "./Heading"
import { Label } from "./Label"
import { PressableInputLike } from "./PressableInputLike"
import { Text } from "./Text"
import { ThemeSwitch } from "./ThemeSwitch"

describe("typography leaves", () => {
    it("maps text tone, weight, icon, and live announcements", () => {
        render(<Text props={{ id: "status", content: "Ready", size: "sm", tone: "accent", weight: "semibold", icon: "complete", isPressLabel: true, live: "polite" }} />)
        const text = document.querySelector("#status")
        expect(text).toHaveAttribute("role", "status")
        expect(text).toHaveAttribute("aria-live", "polite")
        expect(text).toHaveAttribute("data-icon", "true")
        expect(text).toHaveAttribute("data-press-label", "true")
        expect(text).toHaveAttribute("data-tone", "accent")
        expect(text).toHaveTextContent("Ready")
    })

    it("uses a measured loading bar and suppresses its icon", () => {
        render(<Text props={{ content: "Loading", size: "xs", icon: "search" }} isLoading />)
        const text = document.querySelector("[data-component='Text']")
        expect(text).toHaveAttribute("data-loading", "true")
        expect(text).toHaveAttribute("data-icon", "false")
        expect(text).toHaveClass("w-10")
        expect(text).not.toHaveTextContent("Loading")
    })

    it.each([[1, "H1"], [3, "H3"], [4, "H4"]] as const)("uses heading level %s", (level, name) => {
        render(<Heading props={{ content: name, level }} />)
        const heading = screen.getByRole("heading", { name, level })
        expect(heading).toHaveAttribute("data-level", String(level))
        expect(heading).toHaveAttribute("data-scale", "standard")
    })

    it("opts a page-root heading into display scale without changing its outline level", () => {
        render(<Heading props={{ content: "Overview", level: 1, scale: "display" }} />)
        const heading = screen.getByRole("heading", { name: "Overview", level: 1 })
        expect(heading).toHaveAttribute("data-scale", "display")
        expect(heading).toHaveClass("text-4xl")
    })

    it("opts a signal value into metric-lead scale while xs remains muted", () => {
        render(
            <>
                <Text props={{ content: "1,250,000", size: "metric-lead", weight: "semibold" }} />
                <Text props={{ content: "Caption", size: "xs" }} />
            </>,
        )
        expect(screen.getByText("1,250,000")).toHaveAttribute("data-size", "metric-lead")
        expect(screen.getByText("Caption")).toHaveAttribute("data-tone", "muted")
    })

    it("keeps a loading heading hidden while preserving its level", () => {
        render(<Heading props={{ content: "Title", level: 2 }} isLoading />)
        const heading = document.querySelector("[data-component='Heading']")
        expect(heading).toHaveAttribute("aria-hidden", "true")
        expect(heading).toHaveAttribute("data-loading", "true")
    })

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
