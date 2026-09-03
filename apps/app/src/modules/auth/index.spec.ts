import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/modules/api/auth", () => ({
    oauthRedirectUrl: (provider: string, redirectUri: string) => `https://api.test/api/v1/keycloak/${provider}/redirect?redirect_uri=${encodeURIComponent(redirectUri)}`,
}))

import { authenticationOauthRedirectUrl, rememberOauthProvider, takeOauthProvider } from "."

describe("the OAuth provider hand-off", () => {
    beforeEach(() => window.sessionStorage.clear())

    it("remembers the chosen provider and spends it exactly once", () => {
        rememberOauthProvider("github")
        expect(window.sessionStorage.getItem("nivo.oauth.provider")).toBe("github")
        expect(takeOauthProvider()).toBe("github")
        // Spent: a reload of the callback must not replay a trip that already finished.
        expect(window.sessionStorage.getItem("nivo.oauth.provider")).toBeNull()
        expect(takeOauthProvider()).toBe("google")
    })

    it("falls back to the default provider when storage refuses", () => {
        /*
         * The whole `sessionStorage` accessor is replaced for the length of this case. jsdom serves
         * it through a proxy, so neither an instance spy nor a `Storage.prototype` spy is ever
         * reached; swapping the property is the only way to make the browser actually refuse.
         */
        const refuse = () => {
            throw new Error("storage unavailable")
        }
        const real = Object.getOwnPropertyDescriptor(window, "sessionStorage")
        Object.defineProperty(window, "sessionStorage", {
            configurable: true,
            get: refuse,
        })
        try {
            expect(() => rememberOauthProvider("github")).not.toThrow()
            expect(takeOauthProvider()).toBe("google")
        } finally {
            if (real === undefined) Reflect.deleteProperty(window, "sessionStorage")
            else Object.defineProperty(window, "sessionStorage", real)
        }
    })

    it("builds the hand-off URL against the transport's own boundary", () => {
        expect(authenticationOauthRedirectUrl("google", "https://app.test/en/authentication")).toBe(
            "https://api.test/api/v1/keycloak/google/redirect?redirect_uri=https%3A%2F%2Fapp.test%2Fen%2Fauthentication",
        )
    })
})
