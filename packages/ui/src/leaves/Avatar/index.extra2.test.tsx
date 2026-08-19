import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Avatar } from "./"

describe("Avatar fallback image", () => {
    it("emits a local fallback image when no source is supplied", () => {
        const { container } = render(<Avatar props={{ name: "Grace Hopper" }} />)
        const image = container.querySelector("[data-avatar-fallback='dicebear-lorelei']")
        expect(image).toHaveAttribute("alt", "Grace Hopper")
        expect(image).toHaveAttribute("src")
    })
})
