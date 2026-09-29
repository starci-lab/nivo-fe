import { renderToStaticMarkup } from "react-dom/server"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ getMessages: vi.fn(), seen: [] as Array<unknown> }))
type ProviderProbeProps = { readonly messages: unknown; readonly children: ReactNode }
vi.mock("next-intl", () => ({ NextIntlClientProvider: ({ messages, children }: ProviderProbeProps) => { mocks.seen.push(messages); return <section>{children}</section> } }))
vi.mock("next-intl/server", () => ({ getMessages: mocks.getMessages }))

import { MessageScope } from "."

const CATALOGUE = { app: { a: "1" }, authentication: { b: "2" }, agentos: { c: "3" }, provisioning: { d: "4" }, console: { e: "5" } }

describe("MessageScope", () => {
    it("hands the routed stream a provider holding only the namespaces of its scope", async () => {
        mocks.getMessages.mockResolvedValue(CATALOGUE)
        const html = renderToStaticMarkup(await MessageScope({ scope: "authentication", children: <main>sign in</main> }))
        expect(html).toContain("sign in")
        expect(mocks.seen.at(-1)).toEqual({ app: { a: "1" }, authentication: { b: "2" } })
    })

    it("hands the console its whole catalogue", async () => {
        mocks.getMessages.mockResolvedValue(CATALOGUE)
        renderToStaticMarkup(await MessageScope({ scope: "console", children: null }))
        expect(mocks.seen.at(-1)).toEqual(CATALOGUE)
    })
})
