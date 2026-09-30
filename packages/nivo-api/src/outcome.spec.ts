import { describe, expect, it } from "vitest"
import { failed, failedWith, failureKindOfCode, failureKindOfStatus } from "./outcome"

describe("failureKindOfStatus", () => {
    it("names the kind each HTTP status states, and never folds one into another", () => {
        expect(failureKindOfStatus(401)).toBe("refused")
        expect(failureKindOfStatus(403)).toBe("forbidden")
        expect(failureKindOfStatus(404)).toBe("not-found")
        for (const status of [400, 409, 410, 422]) expect(failureKindOfStatus(status)).toBe("invalid")
        for (const status of [408, 429, 500, 502, 503, 504]) expect(failureKindOfStatus(status)).toBe("unavailable")
    })
})

describe("failureKindOfCode", () => {
    it("reads the kind from the words the operation code is built from", () => {
        expect(failureKindOfCode("UNAUTHENTICATED")).toBe("refused")
        expect(failureKindOfCode("purchaser-not-admitted")).toBe("forbidden")
        expect(failureKindOfCode("SALES_REFUSED_DENIED")).toBe("forbidden")
        expect(failureKindOfCode("purchase-not-found-non-disclosing")).toBe("not-found")
        expect(failureKindOfCode("source-unavailable")).toBe("unavailable")
        expect(failureKindOfCode("outcome-unknown")).toBe("unavailable")
        expect(failureKindOfCode("offer-version-stale")).toBe("invalid")
        expect(failureKindOfCode("")).toBe("invalid")
    })
})

describe("failed", () => {
    it("carries the kind, the code, the reason and the status without collapsing any of them", () => {
        expect(failed("forbidden", { status: 403, code: "REFUSED", reason: "no" })).toEqual({
            ok: false,
            kind: "forbidden",
            status: 403,
            code: "REFUSED",
            reason: "no",
            retryable: false,
        })
    })

    it("marks only an unavailable answer retryable unless told otherwise", () => {
        expect(failed("unavailable", { code: "NETWORK", reason: "network" })).toMatchObject({
            retryable: true,
            status: null,
        })
        expect(failed("invalid", { code: "X", reason: "x" })).toMatchObject({ retryable: false })
        expect(failed("invalid", { code: "X", reason: "x", retryable: true })).toMatchObject({ retryable: true })
    })
})

describe("failedWith", () => {
    it("merges the gateway fields beside the common ones", () => {
        expect(failedWith("not-found", { code: "GONE", reason: "gone" }, { operation: "x@1" })).toMatchObject({
            ok: false,
            kind: "not-found",
            code: "GONE",
            operation: "x@1",
        })
    })
})
