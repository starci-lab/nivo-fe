import { describe, expect, it } from "vitest"

import {
    MAX_SHELL_READS_PER_REQUEST,
    canonicalShellReads,
    compareShellSourceIdentity,
    formatShellRead,
    formatShellSourceIdentity
} from "./index"
import { shellSpec } from "./spec-helpers"
const { INSTALLATION, readOf } = shellSpec

describe("canonicalShellReads", () => {
    it("orders a read set by source identity code point rather than by locale collation", () => {
        const ordered = canonicalShellReads([
            readOf({ kind: "runtime" }, 1),
            readOf({ kind: "core_registry" }, 2),
            readOf({ kind: "attention", installationId: INSTALLATION }, 3),
        ])
        expect(ordered?.map((read) => formatShellSourceIdentity(read.identity))).toEqual([
            `attention:{${INSTALLATION}}`,
            "core_registry",
            "runtime",
        ])
    })

    it("refuses a set that repeats one source instead of quietly de-duplicating it", () => {
        expect(canonicalShellReads([readOf({ kind: "runtime" }, 1), readOf({ kind: "runtime" }, 2)])).toBeNull()
    })

    it("refuses an unallocated generation and an unbounded set", () => {
        expect(canonicalShellReads([readOf({ kind: "runtime" }, 0)])).toBeNull()
        expect(
            canonicalShellReads(
                Array.from({ length: MAX_SHELL_READS_PER_REQUEST + 1 }, (_, index) =>
                    readOf({ kind: "attention", installationId: `installation-${index}` }, 1),
                ),
            ),
        ).toBeNull()
    })
})

describe("compareShellSourceIdentity", () => {
    it("orders by code point, so a client reproduces the server's order", () => {
        expect(compareShellSourceIdentity("a", "B")).toBeGreaterThan(0)
        expect(compareShellSourceIdentity("capability:{a}", "core_registry")).toBeLessThan(0)
        expect(compareShellSourceIdentity("runtime", "runtime")).toBe(0)
    })
})

describe("formatShellSourceIdentity", () => {
    it("formats each selection-scoped and receiver-scoped identity in its registered spelling", () => {
        expect(formatShellSourceIdentity({ kind: "core_registry" })).toBe("core_registry")
        expect(formatShellSourceIdentity({ kind: "attention", installationId: INSTALLATION })).toBe(
            `attention:{${INSTALLATION}}`,
        )
        expect(
            formatShellSourceIdentity({ kind: "receiver", installationId: INSTALLATION, intentId: "intent-1" }),
        ).toBe(`receiver:{${INSTALLATION},intent-1}`)
    })
})

describe("formatShellRead", () => {
    it("spells one read as its percent-encoded identity and its generation", () => {
        expect(formatShellRead({ kind: "runtime" }, 9)).toBe("runtime:9")
        expect(formatShellRead({ kind: "attention", installationId: INSTALLATION }, 3)).toBe(
            `attention%3A%7B${INSTALLATION}%7D:3`,
        )
        expect(formatShellRead({ kind: "receiver", installationId: INSTALLATION, intentId: "intent-1" }, 1)).toBe(
            `receiver%3A%7B${INSTALLATION}%2Cintent-1%7D:1`,
        )
    })
})
