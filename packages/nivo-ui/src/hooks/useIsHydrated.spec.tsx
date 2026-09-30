import { render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { useIsHydrated } from "./useIsHydrated"

const HydrationProbe = () => <output>{useIsHydrated() ? "client" : "server"}</output>

describe("useIsHydrated", () => {
    it("uses the server snapshot for markup and the client snapshot after takeover", () => {
        expect(renderToString(<HydrationProbe />)).toContain("server")

        render(<HydrationProbe />)

        expect(screen.getByText("client")).toBeInTheDocument()
    })
})
