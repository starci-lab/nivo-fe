import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LoadingPage } from "./"

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))

describe("LoadingPage", () => {
    it("announces the translated loading label", () => {
        render(<LoadingPage />)
        expect(screen.getByRole("status")).toBeInTheDocument()
    })
})
