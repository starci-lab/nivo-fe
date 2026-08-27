import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
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
