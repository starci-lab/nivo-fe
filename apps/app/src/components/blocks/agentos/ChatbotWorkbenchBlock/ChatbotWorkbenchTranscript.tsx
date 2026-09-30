import type { ChatbotMessagePayload, ChatbotWorkbenchFieldsFragment } from "@/modules/api/__generated__/agentos-controlplane"

import { Badge, EmptyNotice, Text } from "@starci/grammar/common"

import type { Formatter } from "../../../../modules/i18n/formatter"
import type { ChatbotWorkbenchBlockBaseCopy } from "./ChatbotWorkbenchBlock.types"
import {
    CHATBOT_DELIVERY_NOTICE_CLASS_NAME,
    CHATBOT_MESSAGE_BODY_CLASS_NAME,
    CHATBOT_MESSAGE_ROW_CLASS_NAME,
    CHATBOT_OUTBOUND_MESSAGE_ROW_CLASS_NAME,
    CHATBOT_TRANSCRIPT_CLASS_NAME,
} from "./classNames"

type ChatbotConversation = ChatbotWorkbenchFieldsFragment["conversations"][number]

type ChatbotWorkbenchTranscriptProps = {
    readonly selected: ChatbotConversation | null
    readonly messages: ReadonlyArray<ChatbotMessagePayload>
    readonly format: Formatter
    readonly copy: ChatbotWorkbenchBlockBaseCopy
}

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

const PROVIDER_TERMINAL_NOT_DELIVERED = "PROVIDER_TERMINAL_NOT_DELIVERED"

/** One label per delivery state the read model can carry, keeping terminal outcomes distinct. */
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

/** Draw the selected conversation's transcript and its explicit empty states. */
export const ChatbotWorkbenchTranscript = (props: ChatbotWorkbenchTranscriptProps) => {
    const { selected, messages, format, copy } = props
    if (selected === null) return <EmptyNotice message={copy.selectConversation} />
    if (messages.length === 0) return <EmptyNotice message={copy.noMessages} />
    return (
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
                        {deliveryLabel(message, copy)} · {format.dateTime(new Date(message.occurredAt), {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })}
                    </Text>
                    {message.deliveryState === "ambiguous" ? (
                        <div className={CHATBOT_DELIVERY_NOTICE_CLASS_NAME}>
                            <Badge tone="warning">{copy.ambiguous}</Badge>
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    )
}
