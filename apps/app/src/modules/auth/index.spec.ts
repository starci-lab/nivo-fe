import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/modules/api/auth", () => ({
    oauthRedirectUrl: (provider: string, redirectUri: string) =>
        `https://api.test/api/v1/keycloak/${provider}/redirect?redirect_uri=${encodeURIComponent(redirectUri)}`,
}))

import {
    DEFAULT_AUTHENTICATED_LANDING,
    authenticationOauthRedirectUrl,
    rememberOauthProvider,
    takeOauthProvider,
    validatedReturnTo,
} from "."

describe("rememberOauthProvider", () => {
    beforeEach(() => window.sessionStorage.clear())

    it("remembers the chosen provider and spends it exactly once", () => {
        expect(rememberOauthProvider("github")).toEqual({ remembered: true })
        expect(window.sessionStorage.getItem("nivo.oauth.provider")).toBe("github")
        expect(takeOauthProvider()).toBe("github")
        // Spent: a reload of the callback must not replay a trip that already finished.
        expect(window.sessionStorage.getItem("nivo.oauth.provider")).toBeNull()
        expect(takeOauthProvider()).toBe("google")
    })
})

describe("takeOauthProvider", () => {
    beforeEach(() => window.sessionStorage.clear())

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
            expect(rememberOauthProvider("github")).toBe(false)
            expect(takeOauthProvider()).toBe("google")
        } finally {
            if (real === undefined) Reflect.deleteProperty(window, "sessionStorage")
            else Object.defineProperty(window, "sessionStorage", real)
        }
    })
})

describe("authenticationOauthRedirectUrl", () => {
    it("builds the hand-off URL against the transport's own boundary", () => {
        expect(authenticationOauthRedirectUrl("google", "https://app.test/en/authentication")).toBe(
            "https://api.test/api/v1/keycloak/google/redirect?redirect_uri=https%3A%2F%2Fapp.test%2Fen%2Fauthentication",
        )
    })
})

describe("validatedReturnTo", () => {
    it("accepts only an internal path of this app", () => {
        /*
         * The requested destination is untrusted: it arrives on a query a reader can type and a
         * referring page can set, and it is followed only AFTER a session exists - so it may never
         * be what authorized one. Everything that could carry the reader off this origin folds onto
         * the default landing surface instead, without being echoed.
         */
        expect(validatedReturnTo("/overview/apps")).toBe("/overview/apps")
        expect(validatedReturnTo("/")).toBe("/")

        const refused: Array<string | null | undefined> = [
            null,
            undefined,
            "",
            "overview",
            "//evil.test/overview",
            "https://evil.test/overview",
            "/overview\\..\\evil",
            "/overview evil",
            "/overview\tevil",
        ]
        for (const hostile of refused) expect(validatedReturnTo(hostile)).toBeNull()
    })
})

describe("DEFAULT_AUTHENTICATED_LANDING", () => {
    it("names the default authenticated landing surface", () => {
        // data.login.login-return-destination: every missing or unsafe place resolves here
        expect(DEFAULT_AUTHENTICATED_LANDING).toBe("/overview")
    })
})
