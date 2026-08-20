import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Avatar } from "./"

describe("Avatar extra loading state", () => {
    it("hides imagery while loading and preserves its size contract", () => {
        const { container } = render(<Avatar props={{ name: "Ada", src: "/ada.png", size: "lg" }} isLoading />)
        const avatar = container.querySelector("[data-component='Avatar']")
        expect(avatar).toHaveAttribute("aria-hidden", "true")
        expect(avatar).toHaveAttribute("data-size", "lg")
        expect(avatar?.querySelector("img")).not.toBeInTheDocument()
    })
})
