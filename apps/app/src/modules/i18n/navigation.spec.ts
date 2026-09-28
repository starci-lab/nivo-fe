import { describe, expect, it, vi } from "vitest"

const navigation = vi.hoisted(() => ({
    Link: "link",
    redirect: vi.fn(),
    usePathname: vi.fn(),
    useRouter: vi.fn(),
    getPathname: vi.fn(),
}))
const createNavigation = vi.hoisted(() => vi.fn(() => navigation))

vi.mock("next-intl/navigation", () => ({ createNavigation }))
vi.unmock("@/modules/i18n/navigation")

import { Link, getPathname, navigation as created, redirect } from "./navigation"
import { routing } from "./routing"

describe("navigation", () => {
    it("creates one navigation family from the routed locale authority", () => {
        expect(createNavigation).toHaveBeenCalledWith(routing)
        expect(created).toBe(navigation)
        expect({ Link, redirect, getPathname }).toEqual({
            Link: navigation.Link,
            redirect: navigation.redirect,
            getPathname: navigation.getPathname,
        })
    })
})
