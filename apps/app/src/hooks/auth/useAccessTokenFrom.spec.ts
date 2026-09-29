import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    setAccessTokenReader: vi.fn(),
}))

vi.mock("@/modules/api/graphql", () => ({
    setAccessTokenReader: mocks.setAccessTokenReader,
}))

import { useAccessTokenFrom } from "./useAccessTokenFrom"

describe("useAccessTokenFrom", () => {
    it("hands the transport the reader the component supplies", () => {
        const reader = (): string | null => "access-1"

        renderHook(() => useAccessTokenFrom(reader))

        expect(mocks.setAccessTokenReader).toHaveBeenCalledWith(reader)
    })
})
