import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Avatar } from "./"

describe("Avatar", () => {
    it("uses a deterministic fallback avatar and preserves a supplied image", () => {
        const { rerender } = render(<Avatar props={{ name: "Ada Lovelace", size: "lg" }} />)
        const fallback = document.querySelector("[data-avatar-fallback='dicebear-lorelei']")
        expect(fallback).toHaveAttribute("alt", "Ada Lovelace")
        rerender(<Avatar props={{ name: "Ada Lovelace", src: "/ada.png", size: "sm" }} />)
        expect(document.querySelector("[data-size='sm']")).toHaveAttribute("data-size", "sm")
        expect(document.querySelector("[data-avatar-fallback='dicebear-lorelei']")).toBeInTheDocument()
    })

    it("hides imagery while loading and preserves its size contract", () => {
        const { container } = render(<Avatar props={{ name: "Ada", src: "/ada.png", size: "lg" }} isLoading />)
        const avatar = container.firstElementChild
        expect(avatar).toHaveAttribute("aria-hidden", "true")
        expect(avatar).toHaveAttribute("data-size", "lg")
        expect(avatar?.querySelector("img")).not.toBeInTheDocument()
    })

    it("emits a local fallback image when no source is supplied", () => {
        const { container } = render(<Avatar props={{ name: "Grace Hopper" }} />)
        const image = container.querySelector("[data-avatar-fallback='dicebear-lorelei']")
        expect(image).toHaveAttribute("alt", "Grace Hopper")
        expect(image).toHaveAttribute("src")
    })
})
