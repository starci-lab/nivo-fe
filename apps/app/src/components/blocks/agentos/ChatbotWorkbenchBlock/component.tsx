import type { ChatbotMessagePayload, ChatbotWorkbenchFieldsFragment } from "@/modules/api/__generated__/agentos-controlplane"

import {
    Badge,
    Button,
    ChatWorkspace,
    EmptyNotice,
    Heading,
    SurfaceCard,
    Text,
} from "@starci/grammar/common"

import type { Formatter } from "../../../../modules/i18n/formatter"
import { ChatbotChannelRail, ChatbotConversationRail, chatbotControlLabel } from "./ChatbotWorkbenchRails"
import {
    CHATBOT_ACTIONS_CLASS_NAME,
    CHATBOT_CHANNEL_ROW_CLASS_NAME,
    CHATBOT_DELIVERY_NOTICE_CLASS_NAME,
    CHATBOT_HEADER_CLASS_NAME,
    CHATBOT_MESSAGE_BODY_CLASS_NAME,
    CHATBOT_MESSAGE_ROW_CLASS_NAME,
    CHATBOT_OUTBOUND_MESSAGE_ROW_CLASS_NAME,
    CHATBOT_RAIL_CLASS_NAME,
    CHATBOT_TITLE_CLASS_NAME,
    CHATBOT_TRANSCRIPT_CLASS_NAME,
    CHATBOT_WORKSPACE_HOST_CLASS_NAME,
} from "./classNames"

/** Localized, plain-string copy for the installed Chatbot workbench. */
export type ChatbotWorkbenchBlockBaseCopy = {
    readonly title: string
    readonly installation: string
    readonly channels: string
    readonly noChannels: string
    readonly connectZalo: string
    readonly conversations: string
    readonly openConversations: string
    readonly closeConversations: string
    readonly noConversations: string
    readonly selectConversation: string
    readonly selected: string
    readonly automated: string
    readonly handoffPending: string
    readonly humanOwned: string
    readonly returnPending: string
    readonly requestHandoff: string
    readonly resolveHandoff: string
    readonly messages: string
    readonly noMessages: string
    readonly pending: string
    readonly refused: string
    readonly actionRefused: string
    readonly permissionDenied: string
    readonly ambiguous: string
    readonly markDelivered: string
    readonly markFailed: string
    readonly recorded: string
    readonly deliveryQueued: string
    readonly deliveryPossibleStart: string
    readonly providerAccepted: string
    readonly delivered: string
    readonly read: string
    readonly deliveryUnknown: string
    readonly terminalNotDelivered: string
    readonly failedBeforeStart: string
    readonly cancelled: string
}

/** The workbench's settled data, with the version line and locale formatter its connected half resolved. */
/** Settled workbench values the presentation draws without resolving the world itself. */
export type ChatbotWorkbenchBlockBaseData = {
    readonly installationId: string
    readonly workbench: ChatbotWorkbenchFieldsFragment | null
    readonly selectedConversationId: string | null
    readonly pending: boolean
    readonly refusedCode: string | null
    readonly copy: ChatbotWorkbenchBlockBaseCopy
    readonly versionLabel: string
    readonly format: Formatter
}

/** The workbench's commands back into the connected half, including the rail disclosure. */
/** Commands the presentation sends to the connected Chatbot workbench owner. */
export type ChatbotWorkbenchBlockBaseActions = {
    readonly selectConversation: (conversationId: string) => void
    readonly connectZalo: () => void
    readonly setHandoff: (conversationId: string) => void
    readonly resolveHandoff: (conversationId: string) => void
    readonly reconcile: (providerOutboxId: string, delivered: boolean) => void
    readonly setRailOpen: (isOpen: boolean) => void
}

/** The workbench's disclosure situation. */
type ChatbotWorkbenchBlockBaseState = {
    readonly isRailOpen: boolean
}

/** Props for {@link ChatbotWorkbenchBlockBase}: disclosure state, settled data and commands. */
type ChatbotWorkbenchBlockBaseProps = {
    readonly state: ChatbotWorkbenchBlockBaseState
    readonly props: ChatbotWorkbenchBlockBaseData
    readonly on: ChatbotWorkbenchBlockBaseActions
}

/** State-label copy keys: plain strings only, never an interpolating field. */
type ChatbotStateLabelKey =
    | "recorded"
    | "deliveryQueued"
    | "deliveryPossibleStart"
    | "providerAccepted"
    | "delivered"
    | "read"
    | "deliveryUnknown"
    | "terminalNotDelivered"
    | "failedBeforeStart"
    | "cancelled"
    | "automated"
    | "handoffPending"
    | "humanOwned"
    | "returnPending"

/** Terminal provider evidence that the original attempt never reached the recipient. */
const PROVIDER_TERMINAL_NOT_DELIVERED = "PROVIDER_TERMINAL_NOT_DELIVERED"

/**
 * One label per delivery state the read model can carry, so no state is folded into another.
 * `sent` is the durable state Core writes for an accepted attempt; the finer provider
 * observations (`provider-accepted`, `delivered`, `read`) are labelled directly when the read
 * model carries them.
 */
const DELIVERY_STATE_LABELS: Readonly<Record<string, ChatbotStateLabelKey>> = {
    queued: "deliveryQueued",
    sending: "deliveryPossibleStart",
    "provider-accepted": "providerAccepted",
    sent: "providerAccepted",
    delivered: "delivered",
    read: "read",
    ambiguous: "deliveryUnknown",
    "delivery-unknown": "deliveryUnknown",
    "terminal-not-delivered": "terminalNotDelivered",
    "failed-before-start": "failedBeforeStart",
    cancelled: "cancelled",
}

const deliveryLabel = (message: ChatbotMessagePayload, copy: ChatbotWorkbenchBlockBaseCopy): string => {
    if (message.deliveryState === "failed")
        return message.failureCode === PROVIDER_TERMINAL_NOT_DELIVERED
            ? copy.terminalNotDelivered
            : copy.failedBeforeStart
    const label = DELIVERY_STATE_LABELS[message.deliveryState]
    return label === undefined ? copy.recorded : copy[label]
}

/** Responsive console composition whose rail collapse is owned by the published Grammar. */
export const ChatbotWorkbenchBlockBase = (props: ChatbotWorkbenchBlockBaseProps) => {
    const { props: data, on, state } = props
    const { format } = data
    const { isRailOpen } = state
    const selected =
        data.workbench?.conversations.find((conversation) => conversation.id === data.selectedConversationId) ?? null
    const messages =
        selected === null
            ? []
            : (data.workbench?.messages ?? []).filter((message) => message.conversationId === selected.id)
    const ambiguousOutboxId =
        messages.find((message) => message.deliveryState === "ambiguous" && message.providerOutboxId !== null)
            ?.providerOutboxId ?? null
    const conversationRegion =
        selected === null ? (
            <EmptyNotice message={data.copy.selectConversation} />
        ) : messages.length === 0 ? (
            <EmptyNotice message={data.copy.noMessages} />
        ) : (
            <div className={CHATBOT_TRANSCRIPT_CLASS_NAME}>
                {messages.map((message) => (
                    <div
                        className={
                            message.direction === "outbound"
                                ? CHATBOT_OUTBOUND_MESSAGE_ROW_CLASS_NAME
                                : CHATBOT_MESSAGE_ROW_CLASS_NAME
                        }
                        key={message.id}
                    >
                        <div className={CHATBOT_MESSAGE_BODY_CLASS_NAME}>
                            <Text>{message.body}</Text>
                        </div>
                        <Text size="xs" tone="muted">
                            {deliveryLabel(message, data.copy)} · {format.dateTime(new Date(message.occurredAt), {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })}
                        </Text>
                        {message.deliveryState === "ambiguous" ? (
                            <div className={CHATBOT_DELIVERY_NOTICE_CLASS_NAME}>
                                <Badge tone="warning">{data.copy.ambiguous}</Badge>
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
        )
    const actionRegion =
        selected === null ? (
            <div />
        ) : (
            <div className={CHATBOT_ACTIONS_CLASS_NAME}>
                <Button
                    variant="primary"
                    width="fill"
                    isPending={data.pending}
                    onPress={() =>
                        selected.handoffState === "human"
                            ? on.resolveHandoff(selected.id)
                            : on.setHandoff(selected.id)
                    }
                >
                    {selected.handoffState === "human" ? data.copy.resolveHandoff : data.copy.requestHandoff}
                </Button>
                {ambiguousOutboxId === null ? null : (
                    <>
                        <Button
                            variant="secondary"
                            width="fill"
                            isPending={data.pending}
                            onPress={() => on.reconcile(ambiguousOutboxId, true)}
                        >
                            {data.copy.markDelivered}
                        </Button>
                        <Button
                            variant="outline"
                            width="fill"
                            isPending={data.pending}
                            onPress={() => on.reconcile(ambiguousOutboxId, false)}
                        >
                            {data.copy.markFailed}
                        </Button>
                    </>
                )}
            </div>
        )
    return (
        <section aria-label={data.copy.title}>
            <div className={CHATBOT_TITLE_CLASS_NAME}>
                <Heading level={2}>{data.copy.title}</Heading>
                <Text size="sm" tone="muted">
                    {data.versionLabel}
                </Text>
            </div>
            <div className={CHATBOT_WORKSPACE_HOST_CLASS_NAME} data-contract="GAP-3 MEASURE-2 MEASURE-7">
                <ChatWorkspace
                    label={data.copy.title}
                    conversationLabel={data.copy.messages}
                    header={
                        <div className={CHATBOT_HEADER_CLASS_NAME}>
                            <Heading level={3}>{selected?.participantRef ?? data.copy.selectConversation}</Heading>
                            {selected === null ? null : (
                                <Badge tone={selected.handoffState === "human" ? "warning" : "success"}>
                                    {chatbotControlLabel(selected, data.copy, data.pending)}
                                </Badge>
                            )}
                        </div>
                    }
                    conversation={
                        <>
                            {conversationRegion}
                            {data.pending ? (
                                <Text size="sm" live="polite">
                                    {data.copy.pending}
                                </Text>
                            ) : null}
                            {data.refusedCode === null ? null : (
                                <Text size="sm" live="assertive">
                                    {data.refusedCode === "WORKSPACE_CONTROLLER_REFUSED"
                                        ? data.copy.permissionDenied
                                        : data.refusedCode === "CHATBOT_ACTION_REFUSED"
                                          ? data.copy.actionRefused
                                          : data.copy.refused}
                                </Text>
                            )}
                        </>
                    }
                    composer={actionRegion}
                    rail={
                        <div className={CHATBOT_RAIL_CLASS_NAME}>
                            <ChatbotChannelRail props={data} on={on} />
                            <ChatbotConversationRail props={data} on={on} />
                        </div>
                    }
                    railLabel={data.copy.conversations}
                    railOpenLabel={data.copy.openConversations}
                    railCloseLabel={data.copy.closeConversations}
                    isRailOpen={isRailOpen}
                    onRailOpenChange={on.setRailOpen}
                    railWidth="standard"
                />
            </div>
        </section>
    )
}
