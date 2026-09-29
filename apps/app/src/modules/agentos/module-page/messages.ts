import type { ExecuteMessage } from "../../../components/blocks/agentos/ExecuteChatBlock"
import type { ExecuteSession } from "../../../components/blocks/agentos/ExecuteSessionRailBlock"
import type { SetupMessage, SetupRevision } from "../../../components/blocks/agentos/PrivateSetupChatBlock"
import type { AgentosModuleRuntime, AgentosRuntimeSession } from "../../api/agentos-module-runtime"
import type { ModulePageCopy } from "../module-page-copy"
import { executeSessionTitleFor } from "./sessions"

/** The setup conversation lines belonging to one selected session. */
export const setupMessagesFor = (
    runtime: AgentosModuleRuntime,
    selectedSetup: AgentosRuntimeSession | null,
): ReadonlyArray<SetupMessage> =>
    selectedSetup === null
        ? []
        : runtime.messages
              .filter((message) => message.sessionId === selectedSetup.id)
              .map(({ id, role, content }) => ({
                  id,
                  role,
                  content,
              }))

/** The revision rail entries: only sessions that carry a numbered revision and a status. */
export const setupRevisionsFor = (runtime: AgentosModuleRuntime): ReadonlyArray<SetupRevision> =>
    runtime.setupSessions
        .filter(
            (
                item,
            ): item is typeof item & {
                setupRevision: number
                setupStatus: NonNullable<typeof item.setupStatus>
            } => item.setupRevision !== null && item.setupStatus !== null,
        )
        .map((item) => ({
            id: item.id,
            revision: item.setupRevision,
            status: item.setupStatus,
        }))

/** Whether any setup session is still open: starting a new revision is allowed only while none is. */
export const setupOpenFor = (runtime: AgentosModuleRuntime): boolean =>
    runtime.setupSessions.some((item) => item.setupStatus === "open" || item.setupStatus === "ready")

/** The rail entries for the execute sessions of one runtime. */
export const executeSessionsFor = (
    runtime: AgentosModuleRuntime,
    copy: ModulePageCopy,
): ReadonlyArray<ExecuteSession> =>
    runtime.executeSessions.map((item, index) => ({
        id: item.id,
        title:
            item.id === runtime.installation.primaryOpsSessionId
                ? copy.shell.primaryOperations
                : executeSessionTitleFor(item.title, index, copy),
        updatedLabel: new Date(item.updatedAt).toLocaleDateString(),
        status: item.isArchived ? "archived" : "active",
    }))

/** The conversation lines of one selected execute session, with bound context and widget state. */
export const executeMessagesFor = (
    runtime: AgentosModuleRuntime,
    selectedSession: AgentosRuntimeSession | null,
    copy: ModulePageCopy,
): ReadonlyArray<ExecuteMessage> => {
    if (selectedSession === null) return []
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
                    : runtime.installation.runtimeManifest.widgets.find(
                          (candidate) =>
                              candidate.component === widget.rootComponent &&
                              candidate.version === widget.rootVersion,
                      )
            const contextVersion =
                message.contextVersionId === null ? undefined : contextById.get(message.contextVersionId)
            const task = message.taskId === null ? undefined : taskById.get(message.taskId)
            return {
                id: message.id,
                role: message.role,
                content: message.content,
                messageTree: message.messageTree,
                contextLabel:
                    contextVersion === undefined
                        ? copy.shell.noContextApplied
                        : copy.shell.boundContext({ version: contextVersion }),
                widget:
                    widget === undefined
                        ? undefined
                        : {
                              id: widget.id,
                              node:
                                  task === undefined
                                      ? widget.tree
                                      : {
                                            ...widget.tree,
                                            props: {
                                                ...widget.tree.props,
                                                expectedVersion: task.expectedVersion,
                                            },
                                        },
                              actions: registration?.actions ?? [],
                          },
            }
        })
}
