import type { ChatbotWorkbenchFieldsFragment } from "@/modules/api/__generated__/agentos-controlplane"

import {
    Badge,
    Button,
    ChatWorkspace,
    Heading,
    SurfaceCard,
    Text,
} from "@starci/grammar/common"

import type { Formatter } from "../../../../modules/i18n/formatter"
import { ChatbotChannelRail, ChatbotConversationRail, chatbotControlLabel } from "./ChatbotWorkbenchRails"
import {
    CHATBOT_ACTIONS_CLASS_NAME,
    CHATBOT_HEADER_CLASS_NAME,
    CHATBOT_RAIL_CLASS_NAME,
    CHATBOT_TITLE_CLASS_NAME,
    CHATBOT_WORKSPACE_HOST_CLASS_NAME,
} from "./classNames"
import { ChatbotWorkbenchTranscript } from "./ChatbotWorkbenchTranscript"
import type { ChatbotWorkbenchBlockBaseCopy } from "./ChatbotWorkbenchBlock.types"

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
        <SurfaceCard ariaLabel={data.copy.title}>
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
                            <ChatbotWorkbenchTranscript
                                selected={selected}
                                messages={messages}
                                format={format}
                                copy={data.copy}
                            />
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
        </SurfaceCard>
    )
}
