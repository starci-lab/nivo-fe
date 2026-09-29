import { describe, expect, it } from "vitest"
import { moduleRuntimeFixture } from "../../../test-support/mock-result"
import type { NivoQueryReading } from "../../query"
import type { AgentosModuleRuntime } from "../../api/agentos-module-runtime"
import {
    foreignRuntimeFor,
    runtimeForWorkspace,
    runtimeValueText,
    selectedIdentity,
    stringSetting,
} from "./runtime-values"

const readyReading = (runtime: AgentosModuleRuntime): NivoQueryReading<AgentosModuleRuntime> => ({
    status: "ready",
    data: runtime,
})

describe("stringSetting", () => {
    it("returns the stored value when it is a non-blank string", () => {
        expect(stringSetting("gpt-5", "fallback")).toBe("gpt-5")
    })

    it("falls back when the value is missing, blank, or not a string", () => {
        expect(stringSetting(undefined, "fallback")).toBe("fallback")
        expect(stringSetting("   ", "fallback")).toBe("fallback")
        expect(stringSetting(42, "fallback")).toBe("fallback")
    })
})

describe("runtimeValueText", () => {
    it("formats null, primitives, and structures deterministically", () => {
        expect(runtimeValueText(null)).toBe("—")
        expect(runtimeValueText("raw")).toBe("raw")
        expect(runtimeValueText(7)).toBe("7")
        expect(runtimeValueText({ a: 1 })).toBe('{"a":1}')
    })
})

describe("selectedIdentity", () => {
    const rows = [{ id: "s1" }, { id: "s2" }]

    it("keeps an existing identity and falls back to the first", () => {
        expect(selectedIdentity(rows, "s2")).toBe("s2")
        expect(selectedIdentity(rows, "gone")).toBe("s1")
        expect(selectedIdentity(rows, null)).toBe("s1")
        expect(selectedIdentity([], "s1")).toBeNull()
    })
})

describe("runtimeForWorkspace and foreignRuntimeFor", () => {
    it("hands the runtime to the route when the installation belongs to the workspace", () => {
        const runtime = moduleRuntimeFixture({
            installation: { agentWorkspaceId: "ws-own" },
        })
        expect(runtimeForWorkspace(readyReading(runtime), "ws-own")).toBe(runtime)
        expect(foreignRuntimeFor(readyReading(runtime), "ws-own")).toBe(false)
    })

    it("marks the runtime foreign when the workspace id does not match", () => {
        const runtime = moduleRuntimeFixture({
            installation: { agentWorkspaceId: "ws-other" },
        })
        expect(runtimeForWorkspace(readyReading(runtime), "ws-own")).toBeNull()
        expect(foreignRuntimeFor(readyReading(runtime), "ws-own")).toBe(true)
    })

    it("is neither owned nor foreign while the query rests or fails", () => {
        const resting: NivoQueryReading<AgentosModuleRuntime> = { status: "resting" }
        expect(runtimeForWorkspace(resting, "ws")).toBeNull()
        expect(foreignRuntimeFor(resting, "ws")).toBe(false)
        const refused: NivoQueryReading<AgentosModuleRuntime> = {
            status: "failed",
            kind: "refused",
            code: "no-access",
            reason: "denied",
            retryable: false,
        }
        expect(foreignRuntimeFor(refused, "ws")).toBe(false)
    })
})
