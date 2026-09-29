import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { createElement, type ReactElement, type ReactNode } from "react"
import { mutate, SWRConfig } from "swr"
import { afterEach, vi } from "vitest"

SWRConfig.defaultValue.dedupingInterval = 0

// Product code imports the locale-aware navigation owner. Most component tests do not exercise
// routing, so keep that boundary inert by default; route-focused tests replace this module with
// their own hoisted spies. This also avoids evaluating Next's browser router in jsdom.
vi.mock("@/i18n/navigation", () => ({
    Link: "a",
    redirect: vi.fn(),
    usePathname: () => "/",
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    getPathname: (input: { readonly href: string }) => input.href,
}))

/*
 * COPY IN A SPEC IS THE REAL CATALOG, NEVER AN ECHO OF THE KEY.
 *
 * A translator that returns its own key can never fail, so a component that asks for a key the
 * catalog does not hold passed every spec and shipped a dotted path to the reader. Every render
 * below is therefore wrapped in the provider the product mounts, fed the app's own
 * `src/messages/<locale>.json`, and it THROWS on a missing key or a malformed message. Each app
 * project names its catalog folder through NIVO_MESSAGES_DIR; a project without one (the shared
 * package) renders unwrapped. A spec that needs the other language mounts its own provider.
 */
const messagesDir = process.env.NIVO_MESSAGES_DIR
const testLocale = "en"
const messages = messagesDir === undefined ? undefined : JSON.parse(readFileSync(join(messagesDir, `${testLocale}.json`), "utf8"))

const throwOnCopyError = (error: Error): never => { throw error }

const withCatalog = <Options extends { readonly wrapper?: (props: { readonly children: ReactNode }) => ReactElement | null }>(options: Options | undefined): Options | undefined => {
    if (messages === undefined) return options
    const Inner = options?.wrapper
    const Wrapper = ({ children }: { readonly children: ReactNode }) => createElement(
        NextIntlClientProvider,
        { locale: testLocale, messages, timeZone: "UTC", onError: throwOnCopyError, getMessageFallback: ({ namespace, key }) => { throw new Error(`Missing message: ${[namespace, key].filter(Boolean).join(".")}`) } },
        Inner === undefined ? children : createElement(Inner, null, children),
    )
    return { ...options, wrapper: Wrapper } as Options
}

vi.mock("@testing-library/react", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@testing-library/react")>()
    return {
        ...actual,
        render: ((ui: ReactElement, options?: Parameters<typeof actual.render>[1]) => actual.render(ui, withCatalog(options))) as typeof actual.render,
        renderHook: ((callback: never, options?: Parameters<typeof actual.renderHook>[1]) => actual.renderHook(callback, withCatalog(options))) as typeof actual.renderHook,
    }
})

afterEach(async () => {
    cleanup()
    await mutate(() => true, undefined, { revalidate: false })
    for (const key of SWRConfig.defaultValue.cache.keys()) {
        SWRConfig.defaultValue.cache.delete(key)
    }
})

class TestResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

globalThis.ResizeObserver = TestResizeObserver

class TestIntersectionObserver {
    readonly root = null
    readonly rootMargin = ""
    readonly thresholds = []
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] { return [] }
}

globalThis.IntersectionObserver = TestIntersectionObserver
