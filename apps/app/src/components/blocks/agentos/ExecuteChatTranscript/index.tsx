import { createElement } from "react"
import { MarkdownComponent } from "@nivo/ui"
import { Text } from "@starci/grammar/common"
import {
    actorLabel,
    markdownFor,
    type ExecuteChatBlockCopy,
    type ExecuteMessage,
    type TrustedWidgetActionHandler,
    type TrustedWidgetRegistry,
} from "../../../../modules/agentos/execute-chat"
import { EXECUTE_CHAT_TRANSCRIPT_CLASS_NAME } from "./classNames"

/** Props for {@link ExecuteChatTranscript}. */
export type ExecuteChatTranscriptProps = {
    readonly copy: ExecuteChatBlockCopy
    readonly messages: ReadonlyArray<ExecuteMessage>
    readonly registry: TrustedWidgetRegistry
    readonly onWidgetAction?: TrustedWidgetActionHandler
}

/** Draw the settled conversation with fail-closed widget identity lookup. */
export const ExecuteChatTranscript = (props: ExecuteChatTranscriptProps) => {
    const { copy, messages, registry, onWidgetAction }: ExecuteChatTranscriptProps = props
    return (
        <div className={EXECUTE_CHAT_TRANSCRIPT_CLASS_NAME}>
            {messages.map((message, index) => {
                const payload = message.widget
                const Widget =
                    payload === undefined ? undefined : registry[`${payload.node.component}@${payload.node.version}`]
                return (
                    <div key={index}>
                        <Text size="xs" tone="muted" weight="semibold">
                            {actorLabel(message.role, copy)}
                        </Text>
                        <MarkdownComponent markdown={markdownFor(message, copy)} />
                        <Text size="xs" tone="muted">
                            {message.contextLabel}
                        </Text>
                        {payload === undefined ? undefined : Widget === undefined ? (
                            <Text size="sm" tone="muted" live="assertive">
                                {copy.executeChat.widgetRefused}
                            </Text>
                        ) : (
                            createElement(Widget, { payload, onAction: onWidgetAction, copy })
                        )}
                    </div>
                )
            })}
        </div>
    )
}
