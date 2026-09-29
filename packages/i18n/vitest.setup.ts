import { readFileSync } from "node:fs"
import { join } from "node:path"
import { createElement, type JSXElementConstructor, type ReactElement, type ReactNode } from "react"
import { I18nProvider } from "./src/provider"
import { vi } from "vitest"

/*
 * Component specs use the owning app's real catalog. Missing keys throw so a spec cannot hide a
 * misspelled translation behind an echo-key mock.
 */
const messagesDirectory = process.env.I18N_MESSAGES_DIR
const testLocale = "en"
const messages =
    messagesDirectory === undefined
        ? undefined
        : JSON.parse(readFileSync(join(messagesDirectory, `${testLocale}.json`), "utf8"))

const throwOnCopyError = (error: Error): never => {
    throw error
}

type WrapperProps = { readonly children: ReactNode }
type TestOptions = { readonly wrapper?: JSXElementConstructor<WrapperProps> }

const withCatalog = <Options extends TestOptions>(
    options: Options | undefined,
): Options | (Options & { readonly wrapper: JSXElementConstructor<WrapperProps> }) | undefined => {
    if (messages === undefined) return options
    const Inner = options?.wrapper
    const Wrapper: JSXElementConstructor<WrapperProps> = ({ children }) => {
        const content = Inner === undefined ? children : createElement(Inner, null, children)
        return createElement(I18nProvider, {
            locale: testLocale,
            messages,
            timeZone: "UTC",
            onError: throwOnCopyError,
            getMessageFallback: ({ namespace, key }) => {
                throw new Error(`Missing message: ${[namespace, key].filter(Boolean).join(".")}`)
            },
            children: content,
        })
    }
    return Object.assign({}, options, { wrapper: Wrapper })
}

vi.mock("@testing-library/react", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@testing-library/react")>()
    return {
        ...actual,
        render: ((ui: ReactElement, options?: Parameters<typeof actual.render>[1]) =>
            actual.render(ui, withCatalog(options))) as typeof actual.render,
        renderHook: ((callback: never, options?: Parameters<typeof actual.renderHook>[1]) =>
            actual.renderHook(callback, withCatalog(options))) as typeof actual.renderHook,
    }
})
