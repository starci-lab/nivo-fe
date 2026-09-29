import type { AgentosModuleRuntime } from "../../api/agentos-module-runtime"
import type { AgentosRuntimeValue } from "../../api/agentos-runtime-tree"
import type { NivoQueryReading } from "../../query"

/** Read a runtime setting as text, falling back when the stored value is absent or blank. */
export const stringSetting = (value: AgentosRuntimeValue | undefined, fallback: string): string =>
    typeof value === "string" && value.trim().length > 0 ? value : fallback

/** Render one runtime value as the text the module surfaces display. */
export const runtimeValueText = (value: AgentosRuntimeValue): string => {
    if (value === null) return "—"
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value)
    return JSON.stringify(value)
}

/** The runtime one workspace owns once the reading is ready; anything else is absent here. */
export const runtimeForWorkspace = (
    reading: NivoQueryReading<AgentosModuleRuntime>,
    workspaceId: string,
): AgentosModuleRuntime | null =>
    reading.status === "ready" && reading.data.installation.agentWorkspaceId === workspaceId ? reading.data : null

/**
 * Whether a settled runtime answer names another workspace. A foreign answer is not this page's
 * runtime: the page reports it as a not-found, never as a refusal.
 */
export const foreignRuntimeFor = (
    reading: NivoQueryReading<AgentosModuleRuntime>,
    workspaceId: string,
): boolean => reading.status === "ready" && runtimeForWorkspace(reading, workspaceId) === null

/** The selected row identity while it still exists, or the first row once the selection is gone. */
export const selectedIdentity = <T extends { readonly id: string }>(
    rows: ReadonlyArray<T>,
    selectedId: string | null,
): string | null => (rows.some((row) => row.id === selectedId) ? selectedId : (rows[0]?.id ?? null))
