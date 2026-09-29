import { act, cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

const themeState = vi.hoisted(() => ({ resolvedTheme: undefined as string | undefined }))
vi.mock("next-themes", () => ({ useTheme: () => themeState }))

import { NivoGrammarTheme } from "."

const rootOf = (container: HTMLElement) => container.querySelector(".grammar-common-root")

describe("NivoGrammarTheme", () => {
    afterEach(() => {
        cleanup()
        themeState.resolvedTheme = undefined
    })

    it.each(["dark", "light"] as const)("bridges the resolved %s theme onto the family root", async (resolved) => {
        themeState.resolvedTheme = resolved
        let container!: HTMLElement
        await act(async () => {
            container = render(<NivoGrammarTheme>content</NivoGrammarTheme>).container
        })

        expect(rootOf(container)).toHaveAttribute("data-grammar-family", "nivo")
        expect(rootOf(container)).toHaveAttribute("data-grammar-theme", resolved)
    })

    it("stays on system while the provider has resolved nothing", async () => {
        let container!: HTMLElement
        await act(async () => {
            container = render(<NivoGrammarTheme>content</NivoGrammarTheme>).container
        })

        expect(rootOf(container)).toHaveAttribute("data-grammar-theme", "system")
    })
})
