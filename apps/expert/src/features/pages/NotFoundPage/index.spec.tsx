import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { NotFoundPage } from "./"

const localeState = { value: "en" }

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key, useLocale: () => localeState.value }))

describe("NotFoundPage", () => {
    it("leads back to the default-locale home without a prefix", () => {
        localeState.value = "en"
        render(<NotFoundPage />)
        expect(screen.getByText("message")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "home" })).toHaveAttribute("href", "/")
    })

    it("keeps the reader's locale in the way back", () => {
        localeState.value = "vi"
        render(<NotFoundPage />)
        expect(screen.getByRole("link", { name: "home" })).toHaveAttribute("href", "/vi")
    })
})
