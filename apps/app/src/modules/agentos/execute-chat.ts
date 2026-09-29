import type { ComponentType } from "react"
import type { AgentosRuntimeMessageTree } from "../api/agentos-module-runtime"
import type { AgentosRuntimeValue, AgentosRuntimeWidgetNode } from "../api/agentos-runtime-tree"

type RuntimeExecuteChatAttachmentValues = { readonly label: string; readonly mediaType: string }
type RuntimeExecuteChatSchemaValues = { readonly version: string }
type RuntimeLabelsActionValues = { readonly key: string }
type RuntimeLabelsFieldValues = { readonly key: string }

/** Settled display labels and typed formatters supplied by the page owner. */
export type ExecuteChatBlockCopy = {
    readonly executeChat: {
        readonly acceptTask: string
        readonly ai: string
        readonly attachment: (values: RuntimeExecuteChatAttachmentValues) => string
        readonly messageLabel: string
        readonly openWorkbench: string
        readonly placeholder: string
        readonly refused: string
        readonly schema: (values: RuntimeExecuteChatSchemaValues) => string
        readonly send: string
        readonly system: string
        readonly title: string
        readonly typedInput: string
        readonly widgetRefused: string
        readonly you: string
    }
    readonly fields: {
        readonly amount: string
        readonly approvalState: string
        readonly citations: string
        readonly confidence: string
        readonly conflicts: string
        readonly currency: string
        readonly dateTime: string
        readonly options: string
        readonly priority: string
        readonly sla: string
        readonly status: string
        readonly summary: string
        readonly timeZone: string
        readonly title: string
    }
    readonly labels: {
        readonly action: (values: RuntimeLabelsActionValues) => string
        readonly field: (values: RuntimeLabelsFieldValues) => string
    }
    readonly widgets: {
        readonly calendarCaption: string
        readonly calendarNotice: string
        readonly calendarTitle: string
        readonly financeCaption: string
        readonly financeNotice: string
        readonly financeTitle: string
        readonly knowledgeCaption: string
        readonly knowledgeNotice: string
        readonly knowledgeTitle: string
        readonly supportCaption: string
        readonly supportNotice: string
        readonly supportTitle: string
    }
}

/** Trusted widget action advertised by the pinned runtime manifest. */
export type ChatWidgetAction = {
    readonly key: string
    readonly inputKeys: ReadonlyArray<string>
}

/** Validated widget identity attached to one immutable Execute message. */
export type ChatWidgetPayload = {
    readonly id: string
    readonly node: AgentosRuntimeWidgetNode
    readonly actions: ReadonlyArray<ChatWidgetAction>
}

/** One Execute message with its immutable context binding and optional trusted widget. */
export type ExecuteMessage = {
    readonly id: string
    readonly role: "user" | "assistant" | "system"
    readonly content: string
    readonly messageTree?: AgentosRuntimeMessageTree | null
    readonly contextLabel: string
    readonly widget?: ChatWidgetPayload
}

/** Runtime props every trusted widget ComponentType must accept. */
export type TrustedWidgetActionHandler = (
    widgetId: string,
    actionKey: string,
    input: Readonly<Record<string, AgentosRuntimeValue>>,
    taskExpectedVersion?: number,
) => void

/** Runtime props every trusted widget ComponentType must accept. */
export type TrustedWidgetComponentProps = {
    readonly copy: ExecuteChatBlockCopy
    readonly payload: ChatWidgetPayload
    readonly onAction?: TrustedWidgetActionHandler
}

/** Open trusted widget registry; unknown component/version pairs fail closed. */
export type TrustedWidgetRegistry = Readonly<Record<string, ComponentType<TrustedWidgetComponentProps>>>

/** Public Execute conversation boundary for one selected collaborative session. */
export type ExecuteChatBlockProps = {
    readonly copy: ExecuteChatBlockCopy
    readonly sessionTitle: string
    readonly messages: ReadonlyArray<ExecuteMessage>
    readonly pending?: boolean
    readonly refused?: boolean
    readonly registry?: TrustedWidgetRegistry
    readonly onSend: (content: string) => void
    readonly onWidgetAction?: TrustedWidgetActionHandler
}

/** Display the settled role with catalog copy. */
export const actorLabel = (role: ExecuteMessage["role"], copy: ExecuteChatBlockCopy): string => {
    if (role === "user") return copy.executeChat.you
    if (role === "assistant") return copy.executeChat.ai
    return copy.executeChat.system
}

/** Project a trusted message tree to its readable Markdown and attachment copy. */
export const markdownFor = (message: ExecuteMessage, copy: ExecuteChatBlockCopy): string => {
    const nodes = message.messageTree?.nodes ?? []
    const content = nodes
        .flatMap((node) => {
            if (node.type === "markdown") return [node.markdown]
            if (node.type === "attachment")
                return [copy.executeChat.attachment({ label: node.label, mediaType: node.mediaType })]
            return []
        })
        .join("\n\n")
    return content.trim().length > 0 ? content : message.content
}
