import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SearchBox } from "./SearchBox"

describe("navigation leaves", () => {
    it("submits the search query", () => {
        const search = vi.fn()
        render(<SearchBox props={{ label: "Search", placeholder: "Find", shortcut: "⌘K" }} on={{ search }} />)
        fireEvent.change(screen.getByRole("searchbox"), { target: { value: "react" } })
        fireEvent.submit(screen.getByRole("search"))
        expect(search).toHaveBeenCalledWith("react")
        expect(screen.getByText("⌘K")).toBeInTheDocument()
    })
})
