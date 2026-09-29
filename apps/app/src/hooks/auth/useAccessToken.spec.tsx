import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ session: { state: { status: "signed-in", accessToken: "token-1" } as unknown } }))
vi.mock("./useSession", () => ({ useSession: () => mocks.session }))

import { useAccessToken } from "./useAccessToken"

describe("useAccessToken", () => {
    it("answers with the bearer token of a signed-in session", () => {
        mocks.session.state = { status: "signed-in", accessToken: "token-1" }
        expect(renderHook(() => useAccessToken()).result.current).toBe("token-1")
    })

    it.each(["restoring", "anonymous"])("answers null while the session is %s", status => {
        mocks.session.state = { status }
        expect(renderHook(() => useAccessToken()).result.current).toBeNull()
    })
})
