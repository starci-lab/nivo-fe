import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { BOUNDARY_COPY } from "@/modules/landing/boundary"
import { GlobalErrorPage } from "./"

const reload = vi.fn()

afterEach(() => {
    reload.mockClear()
    vi.unstubAllGlobals()
})

describe("GlobalErrorPage", () => {
    it("retries in place for an unexpected failure", () => {
        const retry = vi.fn()
        render(<GlobalErrorPage error={new Error("boom")} onRetry={retry} />)
        fireEvent.click(screen.getByRole("button", { name: BOUNDARY_COPY.unexpected.actionLabel }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("reloads the document for a stale bundle", () => {
        vi.stubGlobal("location", { reload })
        render(<GlobalErrorPage error={Object.assign(new Error("chunk"), { name: "ChunkLoadError" })} onRetry={vi.fn()} />)
        fireEvent.click(screen.getByRole("button", { name: BOUNDARY_COPY.staleBundle.actionLabel }))
        expect(reload).toHaveBeenCalledTimes(1)
    })
})
