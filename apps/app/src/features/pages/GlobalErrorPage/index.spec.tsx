import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "@/testing/axe"
import en from "@/messages/en.json"
import vi_ from "@/messages/vi.json"
import { GlobalErrorPage, readGlobalErrorLocale } from "./"

const reload = vi.fn()

afterEach(() => {
    reload.mockClear()
    vi.unstubAllGlobals()
})

describe("readGlobalErrorLocale", () => {
    it("reads the locale prefix and falls back to the default for a bare address", () => {
        expect(readGlobalErrorLocale("/en/overview")).toBe("en")
        expect(readGlobalErrorLocale("/vi/overview")).toBe("vi")
        expect(readGlobalErrorLocale("/overview")).toBe(readGlobalErrorLocale(null))
    })
})

describe("GlobalErrorPage", () => {
    it("loads the catalogue copy of the address locale and retries in place", async () => {
        const retry = vi.fn()
        render(<GlobalErrorPage error={new Error("boom")} locale="en" onRetry={retry} />)
        expect(await screen.findByText(en.boundary.error.unexpected.message)).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: en.boundary.error.retry }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("reloads the document for a stale bundle in the other locale", async () => {
        vi.stubGlobal("location", { reload })
        render(
            <GlobalErrorPage
                error={Object.assign(new Error("chunk"), { name: "ChunkLoadError" })}
                locale="vi"
                onRetry={vi.fn()}
            />,
        )
        expect(await screen.findByText(vi_.boundary.error.staleBundle.message)).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: vi_.boundary.error.reload }))
        expect(reload).toHaveBeenCalledTimes(1)
    })

    it("has no axe violations", async () => {
        const { container } = render(<GlobalErrorPage error={new Error("boom")} locale="en" onRetry={vi.fn()} />)
        await screen.findByText(en.boundary.error.unexpected.message)
        await expectNoA11yViolations(container)
    })
})
