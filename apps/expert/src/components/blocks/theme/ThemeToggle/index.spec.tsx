import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const themeState = vi.hoisted(() => ({
    theme: undefined as string | undefined,
    resolvedTheme: "light" as string | undefined,
    setTheme: vi.fn(),
}))
vi.mock("next-themes", () => ({ useTheme: () => themeState }))

import { ThemeToggle } from "."
import en from "@/messages/en.json"
import viMessages from "@/messages/vi.json"
import { NextIntlClientProvider } from "next-intl"

const mount = (messages: typeof en | typeof viMessages = en, locale = "en") =>
    render(
        <NextIntlClientProvider locale={locale} messages={messages}>
            <ThemeToggle />
        </NextIntlClientProvider>,
    )

describe("ThemeToggle", () => {
    afterEach(() => {
        cleanup()
        themeState.theme = undefined
        themeState.resolvedTheme = "light"
        themeState.setTheme.mockReset()
    })

    it("carries an accessible name and offers system, light and dark from the catalogue", async () => {
        mount()

        fireEvent.click(screen.getByRole("button", { name: en.theme.label }))
        for (const label of Object.values(en.theme.options)) {
            expect(await screen.findByRole("menuitemradio", { name: label })).toBeInTheDocument()
        }
    })

    it("defaults to system until the person chooses", async () => {
        mount()

        fireEvent.click(screen.getByRole("button", { name: en.theme.label }))
        expect(await screen.findByRole("menuitemradio", { name: en.theme.options.system })).toHaveAttribute(
            "aria-checked",
            "true",
        )
    })

    it("marks the stored choice and hands a new one to the provider", async () => {
        themeState.theme = "dark"
        themeState.resolvedTheme = "dark"
        mount()

        fireEvent.click(screen.getByRole("button", { name: en.theme.label }))
        expect(await screen.findByRole("menuitemradio", { name: en.theme.options.dark })).toHaveAttribute(
            "aria-checked",
            "true",
        )
        fireEvent.click(screen.getByRole("menuitemradio", { name: en.theme.options.light }))
        expect(themeState.setTheme).toHaveBeenCalledWith("light")
    })

    it("speaks Vietnamese from the same keys", () => {
        mount(viMessages, "vi")

        expect(screen.getByRole("button", { name: viMessages.theme.label })).toBeInTheDocument()
    })
})
