import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const replace = vi.fn()
vi.mock("@/i18n/navigation", () => ({
    usePathname: () => "/agentos",
    useRouter: () => ({ replace }),
}))
vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: () => (key: string) => key,
}))

import { LanguageMenu } from "."

describe("LanguageMenu", () => {
    afterEach(() => {
        cleanup()
        replace.mockClear()
    })

    it("replaces only the locale while preserving route and query", async () => {
        window.history.replaceState({}, "", "/en/agentos?workspace=one")
        render(<LanguageMenu />)

        fireEvent.click(screen.getByRole("button", { name: "locale.label" }))
        fireEvent.click(await screen.findByRole("menuitemradio", { name: "locale.options.vi" }))
        expect(replace).toHaveBeenCalledWith("/agentos?workspace=one", { locale: "vi" })
    })

    it("keeps the current locale without replacing the route", async () => {
        render(<LanguageMenu />)

        fireEvent.click(screen.getByRole("button", { name: "locale.label" }))
        fireEvent.click(await screen.findByRole("menuitemradio", { name: "locale.options.en" }))

        expect(replace).not.toHaveBeenCalled()
    })
})