import { fireEvent, render } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import messages from "@/messages/en.json"
import { HomeMotionHeroParallax } from "."

describe("HomeMotionHeroParallax", () => {
    it("tracks pointer movement with the active locale formatter", async () => {
        const { container } = render(
            <NextIntlClientProvider locale="en" messages={messages}>
                <HomeMotionHeroParallax>
                    <span>Artwork</span>
                </HomeMotionHeroParallax>
            </NextIntlClientProvider>,
        )
        const target = container.firstElementChild

        if (!(target instanceof HTMLElement)) {
            throw new Error("Expected the parallax wrapper to render")
        }

        vi.spyOn(target, "getBoundingClientRect").mockReturnValue(new DOMRect(10, 20, 200, 100))
        fireEvent.pointerMove(target, { clientX: 60, clientY: 70, pointerType: "mouse" })

        await expectNoA11yViolations(container)
        expect(container.textContent).toContain("Artwork")
    })
})
