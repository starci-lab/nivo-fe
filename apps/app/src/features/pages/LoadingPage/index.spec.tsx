import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import en from "@/messages/en.json"
import { LoadingPage } from "./"

describe("LoadingPage", () => {
    it("announces the translated loading label", () => {
        render(<LoadingPage />)
        expect(screen.getByRole("status", { name: en.boundary.loading.label })).toBeInTheDocument()
    })
})
