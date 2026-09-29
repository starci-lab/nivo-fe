import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HelmComponentStatusTable } from "./"

describe("HelmComponentStatusTable", () => {
    const row = {
        id: "api",
        name: "API",
        detail: "Healthy",
        kind: "service",
        status: "Ready",
        statusTone: "success" as const,
        resources: "2 pods",
    }

    it("renders each component's public status fields", () => {
        render(<HelmComponentStatusTable props={{ id: "release", rows: [row] }} />)
        expect(screen.getByText("API")).toBeInTheDocument()
        expect(screen.getByText("Healthy")).toBeInTheDocument()
        expect(screen.getByText("2 pods")).toBeInTheDocument()
        expect(screen.getByText("Ready")).toBeInTheDocument()
    })

    it("creates three loading rows without exposing stale values", () => {
        render(<HelmComponentStatusTable props={{ id: "release", rows: [row] }} isLoading />)
        expect(screen.queryByText("API")).not.toBeInTheDocument()
        expect(document.querySelectorAll("[data-loading='true']").length).toBeGreaterThan(3)
    })
})
