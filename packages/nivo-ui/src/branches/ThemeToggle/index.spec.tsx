import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { afterEach, describe, expect, it, vi } from "vitest"

const themeState = vi.hoisted(() => ({
    theme: undefined as string | undefined,
    resolvedTheme: "light" as string | undefined,
    setTheme: vi.fn(),
}))
vi.mock("next-themes", () => ({ useTheme: () => themeState }))

import { ThemeToggle } from "."

const englishTheme = {
    label: "Theme",
    options: { system: "System", light: "Light", dark: "Dark" },
}
const vietnameseTheme = {
    label: "Giao diện",
    options: { system: "Theo hệ thống", light: "Sáng", dark: "Tối" },
}

const messagesFor = (locale: string) => {
    const theme = locale === "vi" ? vietnameseTheme : englishTheme
    return { console: { theme }, theme, site: { theme } }
}

const mount = (namespace = "console.theme", locale = "en") =>
    render(
        <NextIntlClientProvider locale={locale} messages={messagesFor(locale)}>
            <ThemeToggle namespace={namespace} />
        </NextIntlClientProvider>,
    )

describe("ThemeToggle", () => {
    afterEach(() => {
        cleanup()
        themeState.theme = undefined
        themeState.resolvedTheme = "light"
        themeState.setTheme.mockReset()
    })

    it.each(["console.theme", "theme", "site.theme"])("reads the shared option keys from %s", async (namespace) => {
        mount(namespace)

        fireEvent.click(screen.getByRole("button", { name: englishTheme.label }))
        for (const label of Object.values(englishTheme.options)) {
            expect(await screen.findByRole("menuitemradio", { name: label })).toBeInTheDocument()
        }
    })

    it("defaults to system until the person chooses", async () => {
        mount()

        fireEvent.click(screen.getByRole("button", { name: englishTheme.label }))
        expect(await screen.findByRole("menuitemradio", { name: englishTheme.options.system })).toHaveAttribute(
            "aria-checked",
            "true",
        )
    })

    it("marks the stored choice and hands a new one to the provider", async () => {
        themeState.theme = "dark"
        themeState.resolvedTheme = "dark"
        mount()

        fireEvent.click(screen.getByRole("button", { name: englishTheme.label }))
        expect(await screen.findByRole("menuitemradio", { name: englishTheme.options.dark })).toHaveAttribute(
            "aria-checked",
            "true",
        )
        fireEvent.click(screen.getByRole("menuitemradio", { name: englishTheme.options.light }))
        expect(themeState.setTheme).toHaveBeenCalledWith("light")
    })

    it("uses the app's translated namespace", () => {
        mount("site.theme", "vi")

        expect(screen.getByRole("button", { name: vietnameseTheme.label })).toBeInTheDocument()
    })
})
