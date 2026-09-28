import { describe, expect, it, vi } from "vitest"

const navigation = vi.hoisted(() => ({
    useRouter: vi.fn(),
}))

vi.mock("@/modules/i18n/navigation", () => ({ navigation }))
vi.unmock("@/hooks/i18n/useRouter")

import { useRouter } from "./useRouter"

describe("useRouter", () => {
    it("binds the created navigation family's router", () => {
        expect(useRouter).toBe(navigation.useRouter)
    })
})
