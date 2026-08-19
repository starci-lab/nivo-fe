import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Avatar } from "./Avatar"
import { Divider } from "./Divider"
import { SeeMoreLink } from "./SeeMoreLink"

describe("secondary leaves", () => {
    it("renders a labelled divider with two decorative rules", () => {
        render(<Divider props={{ label: "or" }} />)
        expect(screen.getByRole("separator", { name: "or" })).toBeInTheDocument()
        expect(document.querySelectorAll("[aria-hidden='true']")).toHaveLength(2)
        expect(screen.getByText("or")).toBeInTheDocument()
    })

    it("uses a deterministic fallback avatar and preserves a supplied image", () => {
        const { rerender } = render(<Avatar props={{ name: "Ada Lovelace", size: "lg" }} />)
        const fallback = document.querySelector("[data-avatar-fallback='dicebear-lorelei']")
        expect(fallback).toHaveAttribute("alt", "Ada Lovelace")
        rerender(<Avatar props={{ name: "Ada Lovelace", src: "/ada.png", size: "sm" }} />)
        expect(document.querySelector("[data-component='Avatar']")).toHaveAttribute("data-size", "sm")
        expect(document.querySelector("[data-component='Avatar'] [data-avatar-fallback='dicebear-lorelei']")).toBeInTheDocument()
    })

    it("renders the loading shape and normal see-more callback", () => {
        const { rerender } = render(<SeeMoreLink props={{ label: "More" }} isLoading />)
        expect(document.querySelector("[data-component='SeeMoreLink']")).toHaveAttribute("data-loading", "true")
        rerender(<SeeMoreLink props={{ label: "More" }} />)
        expect(screen.getByRole("link", { name: /More/ })).toBeInTheDocument()
    })
})
