import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}))

import { ConsoleTopBar } from "."

describe("ConsoleTopBar", () => {
    afterEach(cleanup)

    it("renders only the business-backed product identity and console title", () => {
        const { container } = render(<ConsoleTopBar />)

        expect(screen.getByRole("heading", { name: "brand" })).toBeInTheDocument()
        expect(screen.getByText("title")).toBeInTheDocument()
        expect(container.querySelectorAll("button")).toHaveLength(0)
        expect(container.querySelectorAll("input")).toHaveLength(0)
    })
})
