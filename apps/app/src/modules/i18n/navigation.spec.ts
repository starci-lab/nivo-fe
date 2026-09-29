import { describe, expect, it, vi } from "vitest"

vi.unmock("@/modules/i18n/navigation")

import { Link, getPathname, navigation as created, redirect } from "./navigation"

describe("navigation", () => {
    it("exposes one navigation family whose primitives are the created ones", () => {
        expect({ Link, redirect, getPathname }).toEqual({
            Link: created.Link,
            redirect: created.redirect,
            getPathname: created.getPathname,
        })
        expect(typeof created.useRouter).toBe("function")
        expect(typeof created.usePathname).toBe("function")
    })

    it("formats a route from the routed locale authority: bare for the default locale, prefixed for the other", () => {
        expect(getPathname({ href: "/wallet", locale: "vi" })).toBe("/wallet")
        expect(getPathname({ href: "/wallet", locale: "en" })).toBe("/en/wallet")
    })
})
