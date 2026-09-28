import { describe, expect, it, vi } from "vitest"

const navigation = vi.hoisted(() => ({
    usePathname: vi.fn(),
}))

vi.mock("@/modules/i18n/navigation", () => ({ navigation }))
vi.unmock("@/hooks/i18n/usePathname")

import { usePathname } from "./usePathname"

describe("usePathname", () => {
    it("binds the created navigation family's pathname reader", () => {
        expect(usePathname).toBe(navigation.usePathname)
    })
})
