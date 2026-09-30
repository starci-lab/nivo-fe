import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LoadingRegionBase } from "./component"

describe("LoadingRegionBase", () => {
    it("marks the region busy and names it with visually hidden status text", () => {
        const { container } = render(
            <LoadingRegionBase state={{}} props={{ statusLabel: "Loading" }} />,
        )

        const region = container.querySelector("[data-loading-region]")
        expect(region).toHaveAttribute("aria-busy", "true")
        expect(screen.getByRole("status")).toHaveTextContent("Loading")
        expect(screen.getByRole("status")).toBeInTheDocument()
        expect(region?.querySelector("[aria-hidden='true']")).not.toBeNull()
    })

    it("holds the caller's skeleton tree instead of the default one", () => {
        render(
            <LoadingRegionBase state={{ children: <p>Resolved shape</p> }} props={{ statusLabel: "Loading" }} />,
        )

        expect(screen.getByText("Resolved shape")).toBeInTheDocument()
    })

    it("is a plain wrapper, with no busy flag and no status, once it is not busy", () => {
        const { container } = render(
            <LoadingRegionBase
                state={{ isBusy: false, children: <p>Resolved shape</p> }}
                props={{ statusLabel: "Loading" }}
            />,
        )

        expect(container.querySelector("[data-loading-region]")).not.toHaveAttribute("aria-busy")
        expect(screen.queryByRole("status")).toBeNull()
        expect(screen.getByText("Resolved shape")).toBeInTheDocument()
    })
})
