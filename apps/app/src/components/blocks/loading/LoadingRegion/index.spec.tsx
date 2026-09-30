import { expectNoA11yViolations } from "@/testing/axe"
import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"

import { LoadingRegion } from "."
import en from "@/messages/en.json"
import vi from "@/messages/vi.json"

describe("LoadingRegion", () => {
    it.each([
        ["en", en],
        ["vi", vi],
    ] as const)("words the status from the %s console catalog", async (locale, messages) => {
        const { container } = render(
            <NextIntlClientProvider locale={locale} messages={messages}>
                <LoadingRegion />
            </NextIntlClientProvider>,
        )

        expect(screen.getByRole("status")).toHaveTextContent(messages.console.loadingStatus)
        await expectNoA11yViolations(container)
    })

    it("prefers a surface-specific sentence when the caller names one", () => {
        render(<LoadingRegion label="Reading the Sales surface…" />)

        expect(screen.getByRole("status")).toHaveTextContent("Reading the Sales surface…")
    })
})
