import { fireEvent, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { HomeMotionHeroParallax } from "."

const { numberFormatter } = vi.hoisted(() => ({
    numberFormatter: vi.fn((value: number) => `localized-${value}`),
}))

vi.mock("next-intl", () => ({
    useFormatter: () => ({ number: numberFormatter }),
}))

describe("HomeMotionHeroParallax", () => {
    it("formats spotlight coordinates through the active locale formatter", () => {
        numberFormatter.mockClear()
        const { container } = render(
            <HomeMotionHeroParallax>
                <span>Artwork</span>
            </HomeMotionHeroParallax>,
        )
        const target = container.firstElementChild

        if (!(target instanceof HTMLElement)) {
            throw new Error("Expected the parallax wrapper to render")
        }

        vi.spyOn(target, "getBoundingClientRect").mockReturnValue(new DOMRect(10, 20, 200, 100))
        fireEvent.pointerMove(target, { clientX: 60, clientY: 70, pointerType: "mouse" })

        expect(numberFormatter).toHaveBeenNthCalledWith(1, 25, { maximumFractionDigits: 2 })
        expect(numberFormatter).toHaveBeenNthCalledWith(2, 50, { maximumFractionDigits: 2 })
    })
})
