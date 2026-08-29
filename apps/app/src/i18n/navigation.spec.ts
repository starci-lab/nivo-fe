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
vi.unmock("@/i18n/navigation")

import { Link, getPathname, redirect, usePathname, useRouter } from "./navigation"
import { routing } from "./routing"

describe("locale navigation exports", () => {
    it("creates one navigation family from the routed locale authority", () => {
        expect(createNavigation).toHaveBeenCalledWith(routing)
        expect({ Link, redirect, usePathname, useRouter, getPathname }).toEqual(navigation)
    })
})