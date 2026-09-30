import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it } from "vitest"
import { expectNoA11yViolations } from "../../../../../apps/app/src/testing/axe"
import en from "../../../../../apps/app/src/messages/en.json"
import { NotFoundPage } from "./"

describe("NotFoundPage", () => {
    it("shows the translated message and links to the app-provided home address", () => {
        render(
            <NextIntlClientProvider locale="en" messages={en}>
                <NotFoundPage homeHref="/en" />
            </NextIntlClientProvider>,
        )
        expect(screen.getByRole("status")).toBeInTheDocument()
        expect(screen.getByText(en.boundary.notFound.message)).toBeInTheDocument()
        expect(screen.getByRole("link", { name: en.boundary.notFound.home })).toHaveAttribute("href", "/en")
    })

    it("has no axe violations", async () => {
        const { container } = render(
            <NextIntlClientProvider locale="en" messages={en}>
                <NotFoundPage homeHref="/en" />
            </NextIntlClientProvider>,
        )
        await expectNoA11yViolations(container)
    })
})
