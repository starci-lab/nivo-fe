import type {
    DiagnosticsSurfaceProps,
    OperateSurfaceProps,
    SettingsFormContentProps,
    SetupSurfaceProps,
    TestSurfaceProps,
} from "./surface-types"
import { isOneOf } from "@nivo/api"

const DIAGNOSTICS_COMPACT_PANES: ReadonlyArray<DiagnosticsSurfaceProps["compactPane"]> = [
    "signals",
    "readiness",
    "evidence",
]
const DIAGNOSTIC_SIGNALS: ReadonlyArray<DiagnosticsSurfaceProps["selectedSignal"]> = ["all", "channel", "ai"]
const OPERATION_TARGETS: ReadonlyArray<OperateSurfaceProps["operationTarget"]> = [
    "customer-chat",
    "customer-workbench",
    "internal-chat",
    "internal-workbench",
]
const OPERATING_MODES: ReadonlyArray<SettingsFormContentProps["operatingMode"]> = ["assist", "autopilot"]
const SETUP_COMPACT_PANES: ReadonlyArray<SetupSurfaceProps["compactPane"]> = ["versions", "conversation", "context"]
const TEST_COMPACT_PANES: ReadonlyArray<TestSurfaceProps["compactPane"]> = ["scenarios", "conversation", "evidence"]
const TEST_MODES: ReadonlyArray<TestSurfaceProps["mode"]> = ["exploratory", "acceptance"]

/** Narrow a diagnostics tab callback to one of its rendered panes. */
export const isDiagnosticsCompactPane = (value: unknown): value is DiagnosticsSurfaceProps["compactPane"] =>
    isOneOf(value, DIAGNOSTICS_COMPACT_PANES)

/** Narrow a diagnostics filter callback to a supported signal. */
export const isDiagnosticSignal = (value: unknown): value is DiagnosticsSurfaceProps["selectedSignal"] =>
    isOneOf(value, DIAGNOSTIC_SIGNALS)

/** Narrow an operation tab callback to a supported destination. */
export const isOperationTarget = (value: unknown): value is OperateSurfaceProps["operationTarget"] =>
    isOneOf(value, OPERATION_TARGETS)

/** Narrow a settings tab callback to a supported operating mode. */
export const isOperatingMode = (value: unknown): value is SettingsFormContentProps["operatingMode"] =>
    isOneOf(value, OPERATING_MODES)

/** Narrow a setup tab callback to one of its rendered panes. */
export const isSetupCompactPane = (value: unknown): value is SetupSurfaceProps["compactPane"] =>
    isOneOf(value, SETUP_COMPACT_PANES)

/** Narrow a test tab callback to one of its rendered panes. */
export const isTestCompactPane = (value: unknown): value is TestSurfaceProps["compactPane"] =>
    isOneOf(value, TEST_COMPACT_PANES)

/** Narrow a test mode callback to an available mode. */
export const isTestMode = (value: unknown): value is TestSurfaceProps["mode"] => isOneOf(value, TEST_MODES)
