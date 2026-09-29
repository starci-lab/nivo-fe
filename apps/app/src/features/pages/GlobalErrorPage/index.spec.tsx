import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import en from "@/messages/boundary/en.json"
import vi_ from "@/messages/boundary/vi.json"
import { GlobalErrorPage, readGlobalErrorLocale } from "./"

const reload = vi.fn()

afterEach(() => {
    reload.mockClear()
    vi.unstubAllGlobals()
})

describe("readGlobalErrorLocale", () => {
    it("reads the locale prefix and falls back to the default for a bare address", () => {
        expect(readGlobalErrorLocale("/en/overview")).toBe("en")
        expect(readGlobalErrorLocale("/overview")).toBe("vi")
        expect(readGlobalErrorLocale(null)).toBe("vi")
    })
})

describe("GlobalErrorPage", () => {
    it("draws the catalogue copy of the address locale and retries in place", () => {
        const retry = vi.fn()
        render(<GlobalErrorPage error={new Error("boom")} locale="en" onRetry={retry} />)
        expect(screen.getByText(en.error.unexpected.message)).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: en.error.retry }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("reloads the document for a stale bundle in the other locale", () => {
        vi.stubGlobal("location", { reload })
        render(<GlobalErrorPage error={Object.assign(new Error("chunk"), { name: "ChunkLoadError" })} locale="vi" onRetry={vi.fn()} />)
        expect(screen.getByText(vi_.error.staleBundle.message)).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: vi_.error.reload }))
        expect(reload).toHaveBeenCalledTimes(1)
    })
})
