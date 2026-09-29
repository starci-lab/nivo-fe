import type { CommandPayloadState } from "./useAccountingWorkbench"

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null && !Array.isArray(value)

/** Narrow a command payload before projecting its optional settlement fields. */
export const isCommandPayloadState = (value: unknown): value is CommandPayloadState => {
    if (!isRecord(value)) return false
    return (
        (value.state === undefined || typeof value.state === "string") &&
        (value.resultId === undefined || value.resultId === null || typeof value.resultId === "string")
    )
}
