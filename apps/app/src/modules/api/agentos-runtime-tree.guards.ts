import type { AgentosRuntimeValue } from "./agentos-runtime-tree"

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
    typeof value === "object" && value !== null && !Array.isArray(value)

/** Narrow a recursively JSON-shaped value admitted by the AgentOS runtime contract. */
export const isAgentosRuntimeValue = (value: unknown): value is AgentosRuntimeValue => {
    if (value === null || typeof value === "string" || typeof value === "boolean") return true
    if (typeof value === "number") return Number.isFinite(value)
    if (Array.isArray(value)) return value.every(isAgentosRuntimeValue)
    return isRecord(value) && Object.values(value).every(isAgentosRuntimeValue)
}

/** Narrow one recursively valid runtime object for immutable dotted-path updates. */
export const isAgentosRuntimeRecord = (
    value: unknown,
): value is Readonly<Record<string, AgentosRuntimeValue>> =>
    isRecord(value) && Object.values(value).every(isAgentosRuntimeValue)
