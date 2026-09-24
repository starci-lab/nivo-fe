import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    setLocaleReader: vi.fn(),
}))

vi.mock("@/modules/api/graphql", () => ({
    setLocaleReader: mocks.setLocaleReader,
}))

import { useLocaleFrom } from "./useLocaleFrom"

describe("useLocaleFrom", () => {
    it("hands the transport the locale reader the component supplies", () => {
        const reader = (): string => "vi"

        renderHook(() => useLocaleFrom(reader))

        expect(mocks.setLocaleReader).toHaveBeenCalledWith(reader)
    })
})