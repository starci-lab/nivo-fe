import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ realtime: { status: "disconnected", reason: null } }))

vi.mock("@/hooks", () => ({
    useProvisioningRealtime: () => mocks.realtime,
}))

import { usePurchaseStatusPhase } from "./usePurchaseStatusPhase"

const phaseInput = {
    purchaseId: "purchase-1",
    answer: undefined,
    error: undefined,
    sessionRestoring: true,
    accessToken: null,
    purchaseOverride: null,
    refreshStatus: vi.fn(async () => undefined),
    statusValidating: false,
    recovering: false,
} as const

describe("usePurchaseStatusPhase", () => {
    it("derives loading while the signed-in session is restoring", () => {
        const { result } = renderHook(() => usePurchaseStatusPhase(phaseInput))

        expect(result.current.phase).toBe("loading")
        expect(result.current.purchase).toBeNull()
        expect(result.current.readyWorkspaceId).toBeNull()
        expect(result.current.reconciling).toBe(false)
    })

    it("derives a denied state from a settled read with no purchase", () => {
        const { result } = renderHook(() => usePurchaseStatusPhase({ ...phaseInput, sessionRestoring: false, error: new Error("read failed") }))

        expect(result.current.phase).toBe("denied")
        expect(result.current.onProvisioningSurface).toBe(false)
    })
})
