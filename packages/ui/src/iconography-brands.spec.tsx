import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { GithubMark, GoogleMark } from "./iconography-brands"

describe("provider marks", () => {
    it("keeps Google multicolor paths and Github currentColor", () => {
        const { container } = render(<><GoogleMark /><GithubMark /></>)
        const paths = container.querySelectorAll("path")
        expect(paths.length).toBeGreaterThan(1)
        expect(paths[0]).toHaveAttribute("fill", "#4285f4")
        expect(container.querySelectorAll("svg")[1]).toHaveAttribute("fill", "currentColor")
    })
})
