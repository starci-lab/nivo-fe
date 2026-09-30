import { cleanup, render } from "@testing-library/react"
import { act, type ReactNode } from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

const themeState = vi.hoisted(() => ({ resolvedTheme: undefined as string | undefined }))
vi.mock("next-themes", () => ({ useTheme: () => themeState }))

import { NivoGrammarTheme } from "."

const rootOf = (container: ParentNode) => container.querySelector("[data-grammar-family='nivo']")
const themeTree = (children: ReactNode = "content") => <NivoGrammarTheme>{children}</NivoGrammarTheme>

describe("NivoGrammarTheme", () => {
    afterEach(() => {
        cleanup()
        themeState.resolvedTheme = undefined
    })

    it.each(["dark", "light"] as const)("bridges the resolved %s theme onto the family root", (resolved) => {
        themeState.resolvedTheme = resolved

        const { container } = render(themeTree())

        expect(rootOf(container)).toHaveAttribute("data-grammar-theme", resolved)
    })

    it("keeps the server theme through hydration before activating the resolved client theme", async () => {
        themeState.resolvedTheme = "dark"
        const serverHtml = renderToString(themeTree())
        const container = document.createElement("div")
        container.innerHTML = serverHtml
        let root: ReturnType<typeof hydrateRoot> | undefined

        expect(serverHtml).toContain('data-grammar-theme="system"')

        try {
            await act(async () => {
                root = hydrateRoot(container, themeTree())
            })

            expect(rootOf(container)).toHaveAttribute("data-grammar-theme", "dark")
        } finally {
            await act(async () => root?.unmount())
        }
    })

    it("stays on system when the provider has resolved nothing", () => {
        const { container } = render(themeTree())

        expect(rootOf(container)).toHaveAttribute("data-grammar-theme", "system")
    })
})
