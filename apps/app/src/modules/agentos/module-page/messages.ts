
import type { MyAgentosModuleRuntimeQuery } from "@/modules/api/__generated__/core"

import type { AgentosRuntimeManifestView, AgentosRuntimeMessageTreeView } from "@/modules/api/agentos-module-runtime"
import { isAgentosRuntimeWidgetNode } from "@/modules/api/agentos-runtime-tree.guards"
import type { ExecuteMessage } from "../../../components/blocks/agentos/ExecuteChatBlock"
import type { ExecuteSession } from "../../../components/blocks/agentos/ExecuteSessionRailBlock"
import type { SetupMessage, SetupRevision } from "../../../components/blocks/agentos/PrivateSetupChatBlock"

import type { Formatter } from "../../i18n/formatter"
import type { ModulePageCopy } from "../module-page-copy"
import { executeSessionTitleFor } from "./sessions"

const messageRoleOf = (role: string): SetupMessage["role"] | null => {
    if (role === "user" || role === "assistant" || role === "system") return role
    return null
}

const setupRevisionStatusOf = (status: string): SetupRevision["status"] | null => {
    if (status === "open" || status === "ready" || status === "completed" || status === "superseded") return status
    return null
}

/** The setup conversation lines belonging to one selected session. */
export const setupMessagesFor = (
    runtime: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>,
    selectedSetup: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>["setupSessions"][number] | null,
): ReadonlyArray<SetupMessage> =>
    selectedSetup === null
        ? []
        : runtime.messages
              .filter((message) => message.sessionId === selectedSetup.id)
              .flatMap(({ id, role, content }) => {
                  const mappedRole = messageRoleOf(role)
                  return mappedRole === null ? [] : [{ id, role: mappedRole, content }]
              })

/** The revision rail entries: only sessions that carry a numbered revision and a status. */
export const setupRevisionsFor = (runtime: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>): ReadonlyArray<SetupRevision> =>
    runtime.setupSessions.flatMap((item) => {
        if (item.setupRevision === null || item.setupStatus === null) return []
        const status = setupRevisionStatusOf(item.setupStatus)
        return status === null ? [] : [{ id: item.id, revision: item.setupRevision, status }]
    })

/** Whether any setup session is still open: starting a new revision is allowed only while none is. */
export const setupOpenFor = (runtime: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>): boolean =>
    runtime.setupSessions.some((item) => item.setupStatus === "open" || item.setupStatus === "ready")

/** The rail entries for the execute sessions of one runtime. */
export const executeSessionsFor = (
    runtime: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>,
    copy: ModulePageCopy,
    format: Formatter,
): ReadonlyArray<ExecuteSession> =>
    runtime.executeSessions.map((item, index) => ({
        id: item.id,
        title:
            item.id === runtime.installation.primaryOpsSessionId
                ? copy.shell.primaryOperations
                : executeSessionTitleFor(item.title, index, copy),
        updatedLabel: format.dateTime(new Date(item.updatedAt), { dateStyle: "medium" }),
        status: item.isArchived ? "archived" : "active",
    }))

/** The conversation lines of one selected execute session, with bound context and widget state. */
export const executeMessagesFor = (
    runtime: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>,
    selectedSession: NonNullable<MyAgentosModuleRuntimeQuery["myAgentosModuleRuntime"]["data"]>["executeSessions"][number] | null,
    copy: ModulePageCopy,
): ReadonlyArray<ExecuteMessage> => {
    if (selectedSession === null) return []
    const manifest: AgentosRuntimeManifestView = runtime.installation.runtimeManifest
    const contextById = new Map(runtime.contextVersions.map((context) => [context.id, context.version]))
    const widgetByMessage = new Map(runtime.widgets.map((widget) => [widget.messageId, widget]))
    const taskById = new Map((runtime.tasks ?? []).map((task) => [task.id, task]))
    return runtime.messages
        .filter((message) => message.sessionId === selectedSession.id)
        .map((message) => {
            const widget = widgetByMessage.get(message.id)
            const registration =
                widget === undefined
                    ? undefined
                    : manifest.widgets.find(
                          (candidate) =>
                              candidate.component === widget.rootComponent &&
                              candidate.version === widget.rootVersion,
                      )
            const messageTree: AgentosRuntimeMessageTreeView | null = message.messageTree
            const contextVersion =
                message.contextVersionId === null ? undefined : contextById.get(message.contextVersionId)
            const task = message.taskId === null ? undefined : taskById.get(message.taskId)
            const rawNode: unknown = widget?.tree
            const node = isAgentosRuntimeWidgetNode(rawNode) ? rawNode : undefined
            return {
                id: message.id,
                role: messageRoleOf(message.role) ?? "system",
                content: message.content,
                messageTree,
                contextLabel:
                    contextVersion === undefined
                        ? copy.shell.noContextApplied
                        : copy.shell.boundContext({ version: contextVersion }),
                widget:
                    widget === undefined || node === undefined
                        ? undefined
                        : {
                              id: widget.id,
                              node:
                                  task === undefined
                                      ? node
                                      : {
                                            ...node,
                                            props: {
                                                ...node.props,
                                                expectedVersion: task.expectedVersion,
                                            },
                                        },
                              actions: registration?.actions ?? [],
                          },
            }
        })
}
