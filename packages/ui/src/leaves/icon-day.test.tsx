import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DayCell } from "./DayCell"
import { IconTile } from "./IconTile"

describe("IconTile", () => {
    it("maps tone and size to the plate", () => {
        const { container } = render(<IconTile props={{ icon: "reward", tone: "success", size: "md" }} />)
        const tile = container.querySelector("[data-component='IconTile']")
        expect(tile).toHaveAttribute("data-tone", "success")
        expect(tile).toHaveAttribute("data-size", "md")
        expect(tile).toHaveClass("size-10", "bg-success-soft")
        expect(tile?.querySelector("svg")).toBeInTheDocument()
    })

    it("renders a hidden loading plate without its glyph", () => {
        const { container } = render(<IconTile props={{ icon: "reward" }} isLoading />)
        const tile = container.querySelector("[data-component='IconTile']")
        expect(tile).toHaveAttribute("aria-hidden", "true")
        expect(tile).toHaveAttribute("data-loading", "true")
        expect(tile?.querySelector("svg")).not.toBeInTheDocument()
    })
})

describe("DayCell", () => {
    it("distinguishes active days and keeps the full date screen-reader only", () => {
        const { container } = render(<DayCell props={{ id: "2026-08-19", weekday: "W", title: "August 19", active: true }} />)
        const day = container.querySelector("[data-component='DayCell']")
        expect(day).toHaveAttribute("data-active", "true")
        expect(day?.querySelector("[aria-hidden='true']")).toHaveClass("bg-accent/80")
        expect(day).toHaveTextContent("W")
        expect(day).toHaveTextContent("August 19")
    })

    it("uses an empty fill and loading skeleton for inactive/loading days", () => {
        const { container, rerender } = render(<DayCell props={{ id: "x", weekday: "M", active: false }} />)
        expect(container.querySelector("[aria-hidden='true']")).toHaveClass("bg-muted/20")
        rerender(<DayCell props={{ id: "x", weekday: "M", active: true }} isLoading />)
        expect(container.querySelector("[aria-hidden='true']")).toHaveClass("text-transparent")
    })
})
