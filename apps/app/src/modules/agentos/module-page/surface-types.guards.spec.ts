import { describe, expect, it } from "vitest"
import {
    isDiagnosticSignal,
    isDiagnosticsCompactPane,
    isOperationTarget,
    isOperatingMode,
    isSetupCompactPane,
    isTestCompactPane,
    isTestMode,
} from "./surface-types.guards"

describe("module page surface guards", () => {
    it("accepts every diagnostics pane and filter", () => {
        for (const value of ["signals", "readiness", "evidence"]) expect(isDiagnosticsCompactPane(value)).toBe(true)
        for (const value of ["all", "channel", "ai"]) expect(isDiagnosticSignal(value)).toBe(true)
    })

    it("accepts every operation target and operating mode", () => {
        for (const value of ["customer-chat", "customer-workbench", "internal-chat", "internal-workbench"])
            expect(isOperationTarget(value)).toBe(true)
        for (const value of ["assist", "autopilot"]) expect(isOperatingMode(value)).toBe(true)
    })

    it("accepts every setup pane, test pane and test mode", () => {
        for (const value of ["versions", "conversation", "context"]) expect(isSetupCompactPane(value)).toBe(true)
        for (const value of ["scenarios", "conversation", "evidence"]) expect(isTestCompactPane(value)).toBe(true)
        for (const value of ["exploratory", "acceptance"]) expect(isTestMode(value)).toBe(true)
    })

    it("rejects values outside the surface vocabularies", () => {
        for (const guard of [
            isDiagnosticsCompactPane,
            isDiagnosticSignal,
            isOperationTarget,
            isOperatingMode,
            isSetupCompactPane,
            isTestCompactPane,
            isTestMode,
        ]) {
            expect(guard("billing")).toBe(false)
            expect(guard(null)).toBe(false)
        }
    })
})
