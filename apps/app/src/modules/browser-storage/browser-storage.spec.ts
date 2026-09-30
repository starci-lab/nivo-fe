import { afterEach, describe, expect, it, vi } from "vitest"
import {
    NAVIGATION_COLLAPSED_KEY,
    OAUTH_PROVIDER_KEY,
    readStored,
    removeStored,
    RETURN_TO_STORAGE_KEY,
    TOP_UP_SESSION_KEY,
    writeStored,
} from "./index"

describe("browser storage keys", () => {
    it("keeps the persisted key names unchanged", () => {
        expect(NAVIGATION_COLLAPSED_KEY).toBe("nivo-console-navigation-collapsed")
        expect(RETURN_TO_STORAGE_KEY).toBe("nivo.auth.return-to")
        expect(OAUTH_PROVIDER_KEY).toBe("nivo.oauth.provider")
        expect(TOP_UP_SESSION_KEY).toBe("nivo.wallet.top-up")
    })
})

describe("browser storage access", () => {
    afterEach(() => {
        window.localStorage.clear()
        window.sessionStorage.clear()
        vi.restoreAllMocks()
    })

    it("writes, reads and removes in the chosen area only", () => {
        expect(writeStored("local", "k", "a")).toBe(true)
        expect(readStored("local", "k")).toBe("a")
        expect(readStored("session", "k")).toBeNull()
        removeStored("local", "k")
        expect(readStored("local", "k")).toBeNull()
    })

    it("returns null for a missing key", () => {
        expect(readStored("session", "missing")).toBeNull()
    })

    it("never throws when storage refuses", () => {
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new Error("quota")
        })
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("denied")
        })
        vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
            throw new Error("denied")
        })
        expect(writeStored("session", "k", "v")).toBe(false)
        expect(readStored("session", "k")).toBeNull()
        expect(() => removeStored("session", "k")).not.toThrow()
    })
})
