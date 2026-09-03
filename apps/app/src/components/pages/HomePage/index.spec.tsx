import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))

import { HomePage } from "."

describe("HomePage", () => {
    it("renders the landing screen's server tree with the brand glyph resolved by name", () => {
        render(<HomePage />)
        // The glyph crosses into `@starci/grammar/common`'s client boundary as a serialisable
        // `IconName`, never as the resolved glyph function - this render would have thrown
        // "Functions cannot be passed directly to Client Components" otherwise.
        expect(document.querySelector("svg[data-usage='heading']")).not.toBeNull()
        expect(screen.getByRole("heading", { level: 1, name: "nivo app" })).toBeInTheDocument()
        expect(screen.getByText("description")).toBeInTheDocument()
    })
})
