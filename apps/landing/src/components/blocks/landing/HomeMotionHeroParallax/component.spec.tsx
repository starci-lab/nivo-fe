import { fireEvent, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { HomeMotionHeroParallaxBase } from "./component"

describe("HomeMotionHeroParallaxBase", () => {
    it("draws the artwork and formats spotlight coordinates through the supplied formatter", () => {
        const formatPercent = vi.fn((value: number) => `${value}%`)
        const { container, getByText } = render(
            <HomeMotionHeroParallaxBase
                state={{ artwork: <span>Artwork</span> }}
                props={{ distance: 26 }}
                on={{ formatPercent }}
            />,
        )
        const target = container.firstElementChild

        if (!(target instanceof HTMLElement)) throw new Error("Expected the parallax wrapper to render")

        vi.spyOn(target, "getBoundingClientRect").mockReturnValue(new DOMRect(10, 20, 200, 100))
        fireEvent.pointerMove(target, { clientX: 60, clientY: 70, pointerType: "mouse" })

        expect(getByText("Artwork")).toBeInTheDocument()
        expect(formatPercent).toHaveBeenNthCalledWith(1, 25)
        expect(formatPercent).toHaveBeenNthCalledWith(2, 50)
    })
})
