import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { GithubMark, GoogleMark } from "./product-brands"

describe("product-brands", () => {
    it("keeps Google multicolor paths and Github currentColor", () => {
        const { container } = render(
            <>
                <GoogleMark />
                <GithubMark />
            </>,
        )
        const paths = container.querySelectorAll("path")
        expect(paths.length).toBeGreaterThan(1)
        expect(paths[0]).toHaveAttribute("fill", "var(--brand-google-blue)")
        expect(container.querySelectorAll("svg")[1]).toHaveAttribute("fill", "currentColor")
    })
})
