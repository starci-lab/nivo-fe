import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { readRouteFailureKind, RouteStateView } from "./"

describe("readRouteFailureKind", () => {
    it("names a stale bundle by error name or by the chunk message", () => {
        expect(readRouteFailureKind({ name: "ChunkLoadError" })).toBe("stale-bundle")
        expect(readRouteFailureKind({ name: "Error", message: "Loading chunk 42 failed." })).toBe("stale-bundle")
        expect(readRouteFailureKind({ name: "Error", message: "Loading CSS chunk app/layout failed" })).toBe(
            "stale-bundle",
        )
    })

    it("treats everything else as unexpected without reading its text", () => {
        expect(readRouteFailureKind({ name: "TypeError", message: "x is undefined" })).toBe("unexpected")
        expect(readRouteFailureKind({})).toBe("unexpected")
    })
})

describe("RouteStateView", () => {
    it("offers retry as a callback and announces the failure", () => {
        const retry = vi.fn()
        render(
            <RouteStateView
                props={{
                    role: "alert",
                    message: "Something went wrong",
                    description: "Try again",
                    actionLabel: "Retry",
                }}
                on={{ action: retry }}
            />,
        )
        expect(screen.getByRole("alert")).toBeInTheDocument()
        expect(screen.getByText("Try again")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Retry" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("offers navigation as a link when an address is given", () => {
        render(
            <RouteStateView props={{ role: "status", message: "Not found", actionLabel: "Home", actionHref: "/" }} />,
        )
        expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/")
        expect(screen.queryByRole("button")).toBeNull()
    })
})
