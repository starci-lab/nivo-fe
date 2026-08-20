import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ActionLink } from "./ActionLink"
import { IconButton } from "./IconButton"
import { Link } from "./Link"
import { NavLink } from "./NavLink"
import { SearchBox } from "./SearchBox"
import { SeeMoreLink } from "./SeeMoreLink"

describe("navigation leaves", () => {
    it("draws external links and reports internal link presses", () => {
        const press = vi.fn()
        render(<><Link props={{ label: "Docs", externalHref: "https://example.com", icon: "course" }} /><Link props={{ label: "Home", emphasis: "brand" }} on={{ press }} /></>)
        expect(screen.getByRole("link", { name: /Docs/ })).toHaveAttribute("href", "https://example.com")
        expect(screen.getByRole("img", { name: "Home" })).toBeInTheDocument()
        fireEvent.click(screen.getByRole("link", { name: /StarCi/ }))
        expect(press).toHaveBeenCalledTimes(1)
    })

    it("exposes current route and tab semantics", () => {
        const press = vi.fn()
        const { rerender } = render(<NavLink props={{ label: "Overview", isCurrent: true, kind: "route", icon: "home" }} on={{ press }} />)
        const route = screen.getByRole("link", { name: "Overview" })
        expect(route).toHaveAttribute("aria-current", "page")
        expect(route).toHaveAttribute("data-current", "true")
        fireEvent.click(route)
        expect(press).toHaveBeenCalledTimes(1)
        rerender(<NavLink props={{ label: "Details", kind: "tab", isCurrent: false }} />)
        expect(screen.getByRole("link", { name: "Details" })).toHaveAttribute("data-kind", "tab")
        expect(screen.getByRole("link", { name: "Details" })).not.toHaveAttribute("aria-current")
    })

    it("preserves action-link target behavior and see-more loading", () => {
        render(<><ActionLink props={{ label: "Open", href: "/open", target: "_blank" }} /><SeeMoreLink props={{ label: "More" }} /></>)
        const action = screen.getByRole("link", { name: "Open" })
        expect(action).toHaveAttribute("target", "_blank")
        expect(action).toHaveAttribute("rel", "noopener")
        expect(screen.getByRole("link", { name: /More/ })).toBeInTheDocument()
    })

    it("submits the search query and exposes icon button labels", () => {
        const search = vi.fn()
        const press = vi.fn()
        render(<><SearchBox props={{ label: "Search", placeholder: "Find", shortcut: "⌘K" }} on={{ search }} /><IconButton props={{ icon: "search", label: "Open search", isActive: true }} on={{ press }} /></>)
        fireEvent.change(screen.getByRole("searchbox"), { target: { value: "react" } })
        fireEvent.submit(screen.getByRole("search"))
        expect(search).toHaveBeenCalledWith("react")
        const button = screen.getByRole("button", { name: "Open search" })
        expect(button).toHaveAttribute("data-active", "true")
        fireEvent.click(button)
        expect(press).toHaveBeenCalledTimes(1)
        expect(screen.getByText("⌘K")).toBeInTheDocument()
    })
})
