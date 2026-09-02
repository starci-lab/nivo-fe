import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DayCell } from "./DayCell"

describe("DayCell", () => {
    it("distinguishes active days and keeps the full date screen-reader only", () => {
        const { container } = render(<DayCell props={{ id: "2026-08-19", weekday: "W", title: "August 19", active: true }} />)
        const day = container.querySelector("li")
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
