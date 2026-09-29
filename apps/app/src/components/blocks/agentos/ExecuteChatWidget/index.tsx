import { Button, Heading, Text } from "@starci/grammar/common"
import type {
    ExecuteChatBlockCopy,
    TrustedWidgetActionHandler,
    TrustedWidgetComponentProps,
} from "../../../../modules/agentos/execute-chat"
import { EXECUTE_CHAT_WIDGET_CLASS_NAME } from "./classNames"

type OperationKind = "support" | "finance" | "calendar" | "knowledge"

const FIELD_KEYS = {
    title: "title",
    summary: "summary",
    priority: "priority",
    status: "status",
    sla: "sla",
    amount: "amount",
    currency: "currency",
    approvalState: "approvalState",
    dateTime: "dateTime",
    timeZone: "timeZone",
    options: "options",
    citations: "citations",
    confidence: "confidence",
    conflicts: "conflicts",
} as const

const operationCopy = (kind: OperationKind, copy: ExecuteChatBlockCopy) => {
    if (kind === "support")
        return {
            title: copy.widgets.supportTitle,
            caption: copy.widgets.supportCaption,
            factKeys: ["title", "summary", "priority", "status", "sla"] as const,
            notice: copy.widgets.supportNotice,
        }
    if (kind === "finance")
        return {
            title: copy.widgets.financeTitle,
            caption: copy.widgets.financeCaption,
            factKeys: ["title", "amount", "currency", "approvalState", "priority", "status"] as const,
            notice: copy.widgets.financeNotice,
        }
    if (kind === "calendar")
        return {
            title: copy.widgets.calendarTitle,
            caption: copy.widgets.calendarCaption,
            factKeys: ["title", "dateTime", "timeZone", "options", "priority", "status"] as const,
            notice: copy.widgets.calendarNotice,
        }
    return {
        title: copy.widgets.knowledgeTitle,
        caption: copy.widgets.knowledgeCaption,
        factKeys: ["title", "summary", "citations", "confidence", "conflicts", "status"] as const,
        notice: copy.widgets.knowledgeNotice,
    }
}

const valueLabel = (value: unknown): string => {
    if (value === null) return "—"
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value)
    return JSON.stringify(value) ?? String(value)
}

const readableKey = (key: string, copy: ExecuteChatBlockCopy): string => {
    const known = Object.prototype.hasOwnProperty.call(FIELD_KEYS, key)
        ? FIELD_KEYS[key as keyof typeof FIELD_KEYS]
        : undefined
    return known === undefined ? copy.labels.field({ key }) : copy.fields[known]
}

const immediateActions = (
    payload: TrustedWidgetComponentProps["payload"],
    onAction: TrustedWidgetActionHandler | undefined,
    copy: ExecuteChatBlockCopy,
) =>
    payload.actions
        .filter((action) => action.inputKeys.length === 0)
        .map((action, index) => (
            <Button key={index} variant="secondary" onPress={() => onAction?.(payload.id, action.key, {})}>
                {copy.labels.action({ key: action.key })}
            </Button>
        ))

const StructuredWidget = ({ copy, payload, onAction }: TrustedWidgetComponentProps) => {
    const facts = Object.entries(payload.node.props)
    return (
        <div className={EXECUTE_CHAT_WIDGET_CLASS_NAME}>
            <div>
                <Heading level={4}>{payload.node.component}</Heading>
                <Text size="xs" tone="muted">
                    {copy.executeChat.schema({ version: payload.node.version })}
                </Text>
            </div>
            {facts.length === 0 ? undefined : (
                <div>
                    {facts.map(([key, value], index) => (
                        <div key={index}>
                            <Text size="sm">{copy.labels.field({ key })}</Text>
                            <Text size="sm">{valueLabel(value)}</Text>
                        </div>
                    ))}
                </div>
            )}
            {payload.actions.some((action) => action.inputKeys.length === 0) ? (
                <div>{immediateActions(payload, onAction, copy)}</div>
            ) : undefined}
            {payload.actions.some((action) => action.inputKeys.length > 0) ? (
                <Text size="sm" tone="muted">
                    {copy.executeChat.typedInput}
                </Text>
            ) : undefined}
        </div>
    )
}

const OperationWidget = ({ copy, payload, onAction }: TrustedWidgetComponentProps) => {
    const kind = payload.node.component
        .replace("nivo.", "")
        .replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
    const operation = operationCopy(
        kind === "supportTask"
            ? "support"
            : kind === "financeApproval"
              ? "finance"
              : kind === "calendarOptions"
                ? "calendar"
                : "knowledge",
        copy,
    )
    const taskId = payload.node.props.taskId
    const expectedVersion = payload.node.props.expectedVersion
    const facts = operation.factKeys.flatMap((key) =>
        Object.hasOwn(payload.node.props, key) ? [[key, payload.node.props[key] ?? null] as const] : [],
    )
    const admitted = new Set(payload.actions.map((action) => action.key))
    const canOpen = typeof taskId === "string" && admitted.has("open-task")
    const canAccept = typeof taskId === "string" && typeof expectedVersion === "number" && admitted.has("accept")
    return (
        <div className={EXECUTE_CHAT_WIDGET_CLASS_NAME}>
            <div>
                <Heading level={4}>{operation.title}</Heading>
                <Text size="xs" tone="muted">
                    {operation.caption}
                </Text>
            </div>
            <div>
                {facts.map(([key, value], index) => (
                    <div key={index}>
                        <Text size="sm">{readableKey(key, copy)}</Text>
                        <Text size="sm" weight="semibold">
                            {valueLabel(value)}
                        </Text>
                    </div>
                ))}
            </div>
            {!canOpen && !canAccept ? undefined : (
                <div>
                    {canOpen ? (
                        <Button
                            key="item-0"
                            variant="secondary"
                            onPress={() => onAction?.(payload.id, "open-task", { taskId })}
                        >
                            {copy.executeChat.openWorkbench}
                        </Button>
                    ) : undefined}
                    {canAccept ? (
                        <Button
                            key="item-1"
                            variant="primary"
                            onPress={() =>
                                onAction?.(payload.id, "accept", { taskId, expectedVersion }, expectedVersion)
                            }
                        >
                            {copy.executeChat.acceptTask}
                        </Button>
                    ) : undefined}
                </div>
            )}
            <Text size="sm" tone="muted">
                {operation.notice}
            </Text>
        </div>
    )
}

/** The props of one trusted runtime widget: its validated payload and the actions it may take. */
export type ExecuteChatWidgetProps = TrustedWidgetComponentProps

/** Render one trusted runtime widget while admitting only the actions in its payload. */
export const ExecuteChatWidget = (props: ExecuteChatWidgetProps) =>
    props.payload.node.component === "nivo.metric" ||
    props.payload.node.component === "nivo.data-table" ||
    props.payload.node.component === "nivo.timeline" ||
    props.payload.node.component === "nivo.action-form" ? (
        <StructuredWidget {...props} />
    ) : (
        <OperationWidget {...props} />
    )
