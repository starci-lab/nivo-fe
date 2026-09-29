import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { BOUNDARY_COPY } from "@/modules/landing/boundary"
import { NotFoundPage } from "./"

describe("NotFoundPage", () => {
    it("leads back to the home page", () => {
        render(<NotFoundPage />)
        expect(screen.getByText(BOUNDARY_COPY.notFound.message)).toBeInTheDocument()
        expect(screen.getByRole("link", { name: BOUNDARY_COPY.notFound.actionLabel })).toHaveAttribute("href", "/")
    })
})
