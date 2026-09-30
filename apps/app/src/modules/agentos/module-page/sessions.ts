
import type { MyAgentosModuleRuntimeQuery } from "@/modules/api/__generated__/core"

import type { ModulePageCopy } from "../module-page-copy"

/** The version number of the context the installation currently serves, if one is applied. */
export const activeVersionFor = (runtime: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>): number | null =>
    runtime.contextVersions.find((context) => context.id === runtime.installation.activeContextVersionId)?.version ??
    null

/** A session title the owner named, or the ordinal the page gives an untitled one. */
export const executeSessionTitleFor = (title: string, index: number, copy: ModulePageCopy): string =>
    title === "New Execute session" ? copy.shell.conversation({ number: index + 1 }) : title

/** The primary operations session identity, or the first session once none is named. */
export const primarySessionFor = (runtime: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>): string | null => {
    const primaryId = runtime.installation.primaryOpsSessionId
    return primaryId !== null && runtime.executeSessions.some((session) => session.id === primaryId)
        ? primaryId
        : (runtime.executeSessions[0]?.id ?? null)
}

/** The execute session a stale or absent selection resolves to. */
export const executeSessionIdFor = (runtime: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>, selectedId: string | null): string | null =>
    runtime.executeSessions.some((session) => session.id === selectedId) ? selectedId : primarySessionFor(runtime)

/** The session a stale or absent selection resolves to, or null when none exists. */
export const executeSessionFor = (
    runtime: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>,
    selectedId: string | null,
): NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>["setupSessions"][number] | null => {
    const id = executeSessionIdFor(runtime, selectedId)
    return runtime.executeSessions.find((session) => session.id === id) ?? null
}

/** The heading one selected execute session shows: the primary label, a title, or the empty state. */
export const selectedSessionTitleFor = (
    selectedSession: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>["executeSessions"][number] | null,
    runtime: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>,
    copy: ModulePageCopy,
): string => {
    if (selectedSession === null) return copy.shell.noExecuteSession
    if (selectedSession.id === runtime.installation.primaryOpsSessionId) return copy.shell.primaryOperations
    return executeSessionTitleFor(selectedSession.title, runtime.executeSessions.indexOf(selectedSession), copy)
}
