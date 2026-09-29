import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HeroBand } from "."

describe("HeroBand", () => {
    it("keeps the route heading inside the requested visual band", () => {
        render(
            <HeroBand variant="company" aria-labelledby="company-title">
                <h1 id="company-title">NIVO</h1>
            </HeroBand>,
        )

        expect(screen.getByRole("region", { name: "NIVO" })).toBeInTheDocument()
    })
})
