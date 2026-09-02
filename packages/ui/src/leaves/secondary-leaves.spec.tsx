import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Avatar } from "./Avatar"

describe("secondary leaves", () => {
    it("uses a deterministic fallback avatar and preserves a supplied image", () => {
        const { rerender } = render(<Avatar props={{ name: "Ada Lovelace", size: "lg" }} />)
        const fallback = document.querySelector("[data-avatar-fallback='dicebear-lorelei']")
        expect(fallback).toHaveAttribute("alt", "Ada Lovelace")
        rerender(<Avatar props={{ name: "Ada Lovelace", src: "/ada.png", size: "sm" }} />)
        expect(document.querySelector("[data-size='sm']")).toHaveAttribute("data-size", "sm")
        expect(document.querySelector("[data-avatar-fallback='dicebear-lorelei']")).toBeInTheDocument()
    })
})
