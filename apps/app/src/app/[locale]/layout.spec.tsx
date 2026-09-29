import { renderToStaticMarkup } from "react-dom/server"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    notFound: vi.fn(),
    getMessages: vi.fn(),
    getTimeZone: vi.fn(),
    getTranslations: vi.fn(),
}))
type ShellProbeProps = {
    readonly children: ReactNode
    readonly props: { readonly locale: string; readonly timeZone: string; readonly messages: unknown }
}
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }))
vi.mock("next-intl/server", () => ({
    getMessages: mocks.getMessages,
    getTimeZone: mocks.getTimeZone,
    getTranslations: mocks.getTranslations,
}))
vi.mock("next/font/google", () => ({ Open_Sans: () => ({ style: { fontFamily: "Open Sans" } }) }))
vi.mock("@/features/layouts/ConsoleLocaleLayout/component", () => ({
    ConsoleLocaleLayoutBase: ({ children, props }: ShellProbeProps) => (
        <section
            data-locale={props.locale}
            data-time-zone={props.timeZone}
            data-messages={Object.keys(props.messages as object).join(",")}
        >
            {children}
        </section>
    ),
}))

import { generateMetadata, generateStaticParams, viewport } from "./layout"
import { ConsoleLocaleLayout } from "@/features/layouts/ConsoleLocaleLayout"

describe("locale root layout", () => {
    it("publishes metadata, viewport, and every shipped locale", async () => {
        mocks.getTranslations.mockResolvedValue((key: string) => `translated-${key}`)
        await expect(generateMetadata()).resolves.toEqual({
            title: "nivo Console",
            description: "translated-description",
        })
        expect(generateStaticParams()).toEqual([{ locale: "vi" }, { locale: "en" }])
        expect(viewport).toEqual({ width: "device-width", initialScale: 1 })
    })

    it("loads request-owned locale resources into the provider shell", async () => {
        mocks.getMessages.mockResolvedValue({
            app: { description: "Console" },
            console: { title: "big" },
            authentication: { title: "sign in" },
        })
        mocks.getTimeZone.mockResolvedValue("Asia/Ho_Chi_Minh")
        const tree = await ConsoleLocaleLayout({
            children: <main>workspace</main>,
            params: Promise.resolve({ locale: "en" }),
        })
        const html = renderToStaticMarkup(tree)
        expect(html).toContain('lang="en"')
        expect(html).toContain('data-locale="en"')
        expect(html).toContain('data-time-zone="Asia/Ho_Chi_Minh"')
        // The shell carries its own copy only; each route group ships the rest.
        expect(html).toContain('data-messages="app"')
        expect(html).toContain("workspace")
    })

    it("rejects an unshipped locale before loading its catalogue", async () => {
        mocks.notFound.mockImplementationOnce(() => {
            throw new Error("NOT_FOUND")
        })
        await expect(
            ConsoleLocaleLayout({ children: null, params: Promise.resolve({ locale: "xx" }) }),
        ).rejects.toThrow("NOT_FOUND")
    })
})
