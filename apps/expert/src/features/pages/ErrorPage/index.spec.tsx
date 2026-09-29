import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ErrorPage } from "./"

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))

const reload = vi.fn()

afterEach(() => {
    reload.mockClear()
    vi.unstubAllGlobals()
})

describe("ErrorPage", () => {
    it("announces the unexpected message and retries in place without printing the exception text", () => {
        const retry = vi.fn()
        render(<ErrorPage error={new Error("secret stack detail")} onRetry={retry} />)
        expect(screen.getByRole("alert")).toBeInTheDocument()
        expect(screen.getByText("unexpected.message")).toBeInTheDocument()
        expect(screen.queryByText(/secret stack detail/u)).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "retry" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("reloads the document for a stale bundle instead of retrying in place", () => {
        vi.stubGlobal("location", { reload })
        const retry = vi.fn()
        render(<ErrorPage error={Object.assign(new Error("chunk"), { name: "ChunkLoadError" })} onRetry={retry} />)
        expect(screen.getByText("staleBundle.message")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "reload" }))
        expect(reload).toHaveBeenCalledTimes(1)
        expect(retry).not.toHaveBeenCalled()
    })
})
