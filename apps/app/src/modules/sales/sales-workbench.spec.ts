import { describe, expect, it } from "vitest"
import type { SalesActionValue } from "@/modules/api/sales"
import { salesWriterFence } from "./sales-workbench"

const ACTION = {
    actionId: "action-1",
    attemptGeneration: 1,
    status: "not-started",
    receiverReceipt: null,
    observationGap: false,
    revision: 2,
} satisfies SalesActionValue

describe("Sales writer fence projection", () => {
    it("returns only a complete fence from the action receipt", () => {
        const action = {
            ...ACTION,
            receiverReceipt: {
                writerFence: { claimTokenHash: "claim-1", fencedAt: "2026-09-30T00:00:00Z" },
            },
        } satisfies SalesActionValue
        expect(salesWriterFence(action)).toEqual({ claimTokenHash: "claim-1", fencedAt: "2026-09-30T00:00:00Z" })
        expect(
            salesWriterFence({
                ...action,
                receiverReceipt: { writerFence: { claimTokenHash: 1, fencedAt: "2026-09-30T00:00:00Z" } },
            }),
        ).toBeNull()
    })
})
