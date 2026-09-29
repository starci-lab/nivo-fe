import type { AgentosModuleRuntime, AgentosRuntimeSession } from "../../api/agentos-module-runtime"
import type { ModulePageCopy } from "../module-page-copy"

/** The version number of the context the installation currently serves, if one is applied. */
export const activeVersionFor = (runtime: AgentosModuleRuntime): number | null =>
    runtime.contextVersions.find((context) => context.id === runtime.installation.activeContextVersionId)?.version ??
    null

/** A session title the owner named, or the ordinal the page gives an untitled one. */
export const executeSessionTitleFor = (title: string, index: number, copy: ModulePageCopy): string =>
    title === "New Execute session" ? copy.shell.conversation({ number: index + 1 }) : title

/** The primary operations session identity, or the first session once none is named. */
export const primarySessionFor = (runtime: AgentosModuleRuntime): string | null => {
    const primaryId = runtime.installation.primaryOpsSessionId
    return primaryId !== null && runtime.executeSessions.some((session) => session.id === primaryId)
        ? primaryId
        : (runtime.executeSessions[0]?.id ?? null)
}

/** The execute session a stale or absent selection resolves to. */
export const executeSessionIdFor = (runtime: AgentosModuleRuntime, selectedId: string | null): string | null =>
    runtime.executeSessions.some((session) => session.id === selectedId) ? selectedId : primarySessionFor(runtime)

/** The session a stale or absent selection resolves to, or null when none exists. */
export const executeSessionFor = (
    runtime: AgentosModuleRuntime,
    selectedId: string | null,
): AgentosRuntimeSession | null => {
    const id = executeSessionIdFor(runtime, selectedId)
    return runtime.executeSessions.find((session) => session.id === id) ?? null
}

/** The heading one selected execute session shows: the primary label, a title, or the empty state. */
export const selectedSessionTitleFor = (
    selectedSession: AgentosModuleRuntime["executeSessions"][number] | null,
    runtime: AgentosModuleRuntime,
    copy: ModulePageCopy,
): string => {
    if (selectedSession === null) return copy.shell.noExecuteSession
    if (selectedSession.id === runtime.installation.primaryOpsSessionId) return copy.shell.primaryOperations
    return executeSessionTitleFor(selectedSession.title, runtime.executeSessions.indexOf(selectedSession), copy)
}
