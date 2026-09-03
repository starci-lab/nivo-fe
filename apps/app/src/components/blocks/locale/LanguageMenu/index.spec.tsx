import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { NextIntlClientProvider } from "next-intl"
import viMessages from "@/messages/vi.json"
import enMessages from "@/messages/en.json"
import { TIME_ZONE } from "@/i18n/config"

const replace = vi.fn()
vi.mock("@/i18n/navigation", async () => ({
    ...(await vi.importActual<typeof import("@/i18n/navigation")>("@/i18n/navigation")),
    usePathname: () => "/agentos",
    useRouter: () => ({ replace }),
}))

import { LanguageMenu } from "."

const renderMenu = (locale: "vi" | "en") => render(<NextIntlClientProvider locale={locale} messages={locale === "vi" ? viMessages : enMessages} timeZone={TIME_ZONE} onError={error => { throw error }}><LanguageMenu /></NextIntlClientProvider>)

describe("LanguageMenu", () => {
    afterEach(() => {
        cleanup()
        replace.mockClear()
    })

    it("replaces only the locale while preserving route and query", async () => {
        window.history.replaceState({}, "", "/en/agentos?workspace=one#details")
        renderMenu("en")

        fireEvent.click(screen.getByRole("button", { name: enMessages.console.locale.label }))
        fireEvent.click(await screen.findByRole("menuitemradio", { name: enMessages.console.locale.options.vi }))
        expect(replace).toHaveBeenCalledWith("/agentos?workspace=one#details", { locale: "vi" })
    })

    it("keeps the current locale without replacing the route", async () => {
        renderMenu("en")

        fireEvent.click(screen.getByRole("button", { name: enMessages.console.locale.label }))
        fireEvent.click(await screen.findByRole("menuitemradio", { name: enMessages.console.locale.options.en }))

        expect(replace).not.toHaveBeenCalled()
    })

    it("switches from Vietnamese to English with the same route state", async () => {
        window.history.replaceState({}, "", "/agentos?workspace=one#details")
        renderMenu("vi")

        fireEvent.click(screen.getByRole("button", { name: viMessages.console.locale.label }))
        fireEvent.click(await screen.findByRole("menuitemradio", { name: viMessages.console.locale.options.en }))

        expect(replace).toHaveBeenCalledWith("/agentos?workspace=one#details", { locale: "en" })
    })
})
