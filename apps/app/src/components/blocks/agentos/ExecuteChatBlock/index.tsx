"use client"

import { useState, type ComponentType } from "react"
import {
    Button, Field, Heading, MarkdownComponent, SurfaceCard, Text, Tree,
    defineContractComponent, defineContractProjection, defineLeafComponent,
} from "@nivo/ui"
import type { AgentosRuntimeMessageTree, AgentosRuntimeValue, AgentosRuntimeWidgetNode } from "@/modules/api/console"

/** Trusted widget action advertised by the pinned runtime manifest. */
export type ChatWidgetAction = { readonly key: string; readonly inputKeys: ReadonlyArray<string> }

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
    readonly payload: ChatWidgetPayload
    readonly onAction?: TrustedWidgetActionHandler
}

/** Open trusted widget registry; unknown component/version pairs fail closed. */
export type TrustedWidgetRegistry = Readonly<Record<string, ComponentType<TrustedWidgetComponentProps>>>

/** Runtime data passed through the stable Execute chat body ComponentType. */
export type ExecuteChatContentProps = {
    readonly messages: ReadonlyArray<ExecuteMessage>
    readonly draft: string
    readonly composerKey: number
    readonly pending: boolean
    readonly refused: boolean
    readonly registry: TrustedWidgetRegistry
    readonly onDraft: (content: string) => void
    readonly onSubmit: () => void
    readonly onWidgetAction?: TrustedWidgetActionHandler
}

/** Public Execute conversation boundary for one selected collaborative session. */
export type ExecuteChatBlockProps = {
    readonly sessionTitle: string
    readonly messages: ReadonlyArray<ExecuteMessage>
    readonly pending?: boolean
    readonly refused?: boolean
    readonly registry?: TrustedWidgetRegistry
    readonly onSend: (content: string) => void
    readonly onWidgetAction?: TrustedWidgetActionHandler
}

const valueLabel = (value: AgentosRuntimeValue): string => {
    if (value === null) return "—"
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value)
    return JSON.stringify(value)
}

const StructuredWidget = ({ payload, onAction }: TrustedWidgetComponentProps) => {
    const facts = Object.entries(payload.node.props)
    const immediateActions = payload.actions.filter((action) => action.inputKeys.length === 0)
    return (
        <Tree contract="agentos-widget-panel" render={defineContractComponent("agentos-widget-panel", {
            identity: defineContractComponent("subject-over-muted-caption", {
                subject: defineLeafComponent("heading", {}, () => <Heading props={{ content: payload.node.component, level: 4 }} />),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: `Trusted schema ${payload.node.version}`, size: "xs", tone: "muted" }} />
                )),
            }),
            facts: facts.length === 0
                ? undefined
                : defineContractComponent("labelled-fact-stack", {
                    fact: facts.map(([key, value]) => defineContractComponent("label-value-row", {
                        label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: key, size: "sm" }} />),
                        value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: valueLabel(value), size: "sm" }} />),
                    })),
                }),
            action: immediateActions.length === 0
                ? undefined
                : defineContractComponent("inline-action-run", {
                    action: immediateActions.map((action) => defineLeafComponent("button", {}, () => (
                        <Button
                            props={{ label: action.key, variant: "secondary" }}
                            on={{ press: () => onAction?.(payload.id, action.key, {}) }}
                        />
                    ))),
                }),
            refusal: payload.actions.some((action) => action.inputKeys.length > 0)
                ? defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: "Actions requiring typed input continue in the registered workbench.", size: "sm", tone: "muted" }} />
                ))
                : undefined,
        })} />
    )
}

type OperationWidgetProps = TrustedWidgetComponentProps & {
    readonly title: string
    readonly caption: string
    readonly factKeys: ReadonlyArray<string>
    readonly notice: string
}

const readableKey = (key: string): string => key.replace(/([a-z])([A-Z])/gu, "$1 $2").replace(/^./u, (value) => value.toUpperCase())

const OperationWidget = ({ payload, onAction, title, caption, factKeys, notice }: OperationWidgetProps) => {
    const taskId = payload.node.props.taskId
    const expectedVersion = payload.node.props.expectedVersion
    const facts = factKeys.flatMap((key) => Object.hasOwn(payload.node.props, key)
        ? [[key, payload.node.props[key]] as const]
        : [])
    const admitted = new Set(payload.actions.map((action) => action.key))
    const canOpen = typeof taskId === "string" && admitted.has("open-task")
    const canAccept = typeof taskId === "string" && typeof expectedVersion === "number" && admitted.has("accept")
    return (
        <Tree contract="agentos-widget-panel" render={defineContractComponent("agentos-widget-panel", {
            identity: defineContractComponent("subject-over-muted-caption", {
                subject: defineLeafComponent("heading", {}, () => <Heading props={{ content: title, level: 4 }} />),
                caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: caption, size: "xs", tone: "muted" }} />
                )),
            }),
            facts: defineContractComponent("labelled-fact-stack", {
                fact: facts.map(([key, value]) => defineContractComponent("label-value-row", {
                    label: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: readableKey(key), size: "sm" }} />),
                    value: defineLeafComponent("text", { size: "sm" }, () => <Text props={{ content: valueLabel(value), size: "sm", weight: "semibold" }} />),
                })),
            }),
            action: !canOpen && !canAccept ? undefined : defineContractComponent("inline-action-run", {
                action: [
                    ...(canOpen ? [defineLeafComponent("button", {}, () => (
                        <Button
                            props={{ label: "Open in workbench", variant: "secondary" }}
                            on={{ press: () => onAction?.(payload.id, "open-task", { taskId }) }}
                        />
                    ))] : []),
                    ...(canAccept ? [defineLeafComponent("button", {}, () => (
                        <Button
                            props={{ label: "Accept task", variant: "primary" }}
                            on={{ press: () => onAction?.(payload.id, "accept", { taskId, expectedVersion }, expectedVersion) }}
                        />
                    ))] : []),
                ],
            }),
            refusal: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: notice, size: "sm", tone: "muted" }} />
            )),
        })} />
    )
}

const SupportTaskWidget = (props: TrustedWidgetComponentProps) => (
    <OperationWidget {...props} title="Support follow-up" caption="SLA-aware customer task" factKeys={["title", "summary", "priority", "status", "sla"]} notice="Nivo may triage and draft; refunds, remedies and sensitive-data disclosure still require the configured authority." />
)

const FinanceApprovalWidget = (props: TrustedWidgetComponentProps) => (
    <OperationWidget {...props} title="Finance approval" caption="Evidence-backed owner decision" factKeys={["title", "amount", "currency", "approvalState", "priority", "status"]} notice="Accept queues a review task only. Nivo cannot approve its own work or execute payment." />
)

const CalendarOptionsWidget = (props: TrustedWidgetComponentProps) => (
    <OperationWidget {...props} title="Scheduling options" caption="Timezone-normalized proposal" factKeys={["title", "dateTime", "timeZone", "options", "priority", "status"]} notice="Options remain proposals until a participant confirms; the calendar is not silently changed." />
)

const KnowledgeEvidenceWidget = (props: TrustedWidgetComponentProps) => (
    <OperationWidget {...props} title="Knowledge evidence" caption="Grounded answer with provenance" factKeys={["title", "summary", "citations", "confidence", "conflicts", "status"]} notice="Sources, conflicts and confidence remain visible; unsupported claims fail closed." />
)

/** Built-in trusted widget ComponentTypes aligned with the backend registry. */
export const DEFAULT_WIDGET_REGISTRY: TrustedWidgetRegistry = {
    "nivo.metric@1.0.0": StructuredWidget,
    "nivo.data-table@1.0.0": StructuredWidget,
    "nivo.timeline@1.0.0": StructuredWidget,
    "nivo.action-form@1.0.0": StructuredWidget,
    "nivo.support-task@1.0.0": SupportTaskWidget,
    "nivo.finance-approval@1.0.0": FinanceApprovalWidget,
    "nivo.calendar-options@1.0.0": CalendarOptionsWidget,
    "nivo.knowledge-evidence@1.0.0": KnowledgeEvidenceWidget,
}

const actorLabel = (role: ExecuteMessage["role"]): string => {
    if (role === "user") return "You"
    if (role === "assistant") return "Nivo AI"
    return "System"
}

const widgetProjection = (
    payload: ChatWidgetPayload,
    registry: TrustedWidgetRegistry,
    onAction: TrustedWidgetActionHandler | undefined,
) => defineContractProjection("agentos-widget-panel", () => {
    const Widget = registry[`${payload.node.component}@${payload.node.version}`]
    if (Widget === undefined) {
        return (
            <Tree contract="agentos-widget-panel" render={defineContractComponent("agentos-widget-panel", {
                identity: defineContractComponent("subject-over-muted-caption", {
                    subject: defineLeafComponent("heading", {}, () => <Heading props={{ content: "Widget refused", level: 4 }} />),
                    caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: `${payload.node.component}@${payload.node.version}`, size: "xs", tone: "muted" }} />
                    )),
                }),
                refusal: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: "No trusted ComponentType is registered for this schema identity.", size: "sm", tone: "muted", live: "assertive" }} />
                )),
            })} />
        )
    }
    return <Widget payload={payload} onAction={onAction} />
})

const markdownFor = (message: ExecuteMessage): string => {
    const nodes = message.messageTree?.nodes ?? []
    const content = nodes.flatMap((node) => {
        if (node.type === "markdown") return [node.markdown]
        if (node.type === "attachment") return [`Attachment: ${node.label} · ${node.mediaType}`]
        return []
    }).join("\n\n")
    return content.trim().length > 0 ? content : message.content
}

const ExecuteChatContent = ({
    messages, draft, composerKey, pending, refused, registry, onDraft, onSubmit, onWidgetAction,
}: ExecuteChatContentProps) => (
    <Tree contract="agentos-chat-body" render={defineContractComponent("agentos-chat-body", {
        message: messages.map((message) => defineContractComponent("agentos-execute-message", {
            actor: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: actorLabel(message.role), size: "xs", tone: "muted", weight: "semibold" }} />
            )),
            content: defineContractProjection("agentos-markdown-content", () => (
                <MarkdownComponent markdown={markdownFor(message)} />
            )),
            context: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: message.contextLabel, size: "xs", tone: "muted" }} />
            )),
            widget: message.widget === undefined ? undefined : widgetProjection(message.widget, registry, onWidgetAction),
        })),
        composer: defineContractComponent("form-column", {
            field: [defineContractProjection("label-field-hint", () => (
                <Field
                    key={composerKey}
                    props={{
                        id: "agentos-execute-message",
                        name: "executeMessage",
                        label: "Message this Execute session",
                        placeholder: "Ask Nivo to execute…",
                        disabled: pending,
                    }}
                    on={{ change: onDraft }}
                />
            ))],
            submit: defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: "Send", variant: "primary", disabled: draft.trim().length === 0, isPending: pending }}
                    on={{ press: onSubmit }}
                />
            )),
        }),
        notice: refused
            ? defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: "The Execute operation was refused; no message or widget was appended.", size: "sm", tone: "muted", live: "assertive" }} />
            ))
            : undefined,
    })} />
)

const EXECUTE_CHAT_CONTENT = defineContractComponent("agentos-chat-body", ExecuteChatContent)

/** Draw Execute messages and fail-closed widgets through the trusted ComponentType registry. */
export const ExecuteChatBlock = ({
    sessionTitle,
    messages,
    pending = false,
    refused = false,
    registry = DEFAULT_WIDGET_REGISTRY,
    onSend,
    onWidgetAction,
}: ExecuteChatBlockProps) => {
    const [draft, setDraft] = useState("")
    const [composerKey, setComposerKey] = useState(0)
    const submit = () => {
        const content = draft.trim()
        if (content.length === 0) return
        onSend(content)
        setDraft("")
        setComposerKey((current) => current + 1)
    }
    return (
        <SurfaceCard
            props={{ label: "Execute chat", fact: sessionTitle }}
            contract="agentos-chat-body"
            render={EXECUTE_CHAT_CONTENT}
            contentProps={{
                messages, draft, composerKey, pending, refused, registry,
                onDraft: setDraft, onSubmit: submit, onWidgetAction,
            }}
        />
    )
}

/** Source-level tier marker for the pure Execute chat and widget boundary. */
export const meta = { shape: "block", world: "pure" } as const
