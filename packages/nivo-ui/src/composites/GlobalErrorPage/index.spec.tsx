import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { expectNoA11yViolations } from "../../../../../apps/app/src/testing/axe"
import { GlobalErrorPage } from "./"

const reload = vi.fn()

afterEach(() => {
    reload.mockClear()
    vi.unstubAllGlobals()
})

const readBoundaryCopy = (language: string) => ({
    error: {
        unexpected: { message: `${language} unexpected`, description: `${language} description` },
        staleBundle: { message: `${language} stale`, description: `${language} reload description` },
        retry: `${language} retry`,
        reload: `${language} reload`,
    },
})

describe("GlobalErrorPage", () => {
    it("loads the boundary copy for the address locale and retries in place", async () => {
        const retry = vi.fn()
        const loadBoundaryCopy = vi.fn(async () => readBoundaryCopy("en"))
        render(
            <GlobalErrorPage error={new Error("boom")} locale="en" loadBoundaryCopy={loadBoundaryCopy} onRetry={retry} />,
        )
        expect(await screen.findByText("en unexpected")).toBeInTheDocument()
        expect(loadBoundaryCopy).toHaveBeenCalledTimes(1)
        fireEvent.click(screen.getByRole("button", { name: "en retry" }))
        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("reloads the document for a stale bundle", async () => {
        vi.stubGlobal("location", { reload })
        const retry = vi.fn()
        const loadBoundaryCopy = vi.fn(async () => readBoundaryCopy("vi"))
        render(
            <GlobalErrorPage
                error={Object.assign(new Error("chunk"), { name: "ChunkLoadError" })}
                locale="vi"
                loadBoundaryCopy={loadBoundaryCopy}
                onRetry={retry}
            />,
        )
        expect(await screen.findByText("vi stale")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "vi reload" }))
        expect(reload).toHaveBeenCalledTimes(1)
        expect(retry).not.toHaveBeenCalled()
    })

    it("has no axe violations", async () => {
        const { container } = render(
            <GlobalErrorPage
                error={new Error("boom")}
                locale="en"
                loadBoundaryCopy={async () => readBoundaryCopy("en")}
                onRetry={vi.fn()}
            />,
        )
        await screen.findByText("en unexpected")
        await expectNoA11yViolations(container)
    })
})
