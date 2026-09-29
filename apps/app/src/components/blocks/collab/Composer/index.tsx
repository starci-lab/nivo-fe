import type {
    GroupChatPageLabels,
    GroupChatPageView,
    GroupChatPageActions,
} from "../../../../modules/collab/group-chat/types"
import {
    GROUP_CHAT_FIELD_BODY_CLASS_NAME,
    getGroupChatComposerClassName,
    getGroupChatComposerFrameClassName,
    GROUP_CHAT_COMPOSER_INPUT_CLASS_NAME,
    getGroupChatComposerActionsClassName,
    GROUP_CHAT_COMPOSER_GLYPHS_CLASS_NAME,
    GROUP_CHAT_COMPOSER_SEND_CLASS_NAME,
    GROUP_CHAT_SEND_STATE_CLASS_NAME,
    GROUP_CHAT_SR_ONLY_CLASS_NAME,
} from "./classNames"
import { Button, Icon, IconButton, Input, Text } from "@starci/grammar/common"
import { IconSource } from "@nivo/ui"

/** Props for the pinned composer: draft, send state and the answering banner. */
type ComposerProps = {
    readonly view: GroupChatPageView
    readonly on: GroupChatPageActions
    readonly labels: GroupChatPageLabels
    /** The decision composite draws a glyph-only send control; the growth composite keeps the labelled one. */
    readonly decision: boolean
    /** The compact composer keeps the same row on a shorter inset. */
    readonly compact?: boolean
}

/** Render the message composer and its action states. */
export const Composer = (props: ComposerProps) => {
    const { view, on, labels, decision, compact = false } = props
    return (
        <div className={GROUP_CHAT_FIELD_BODY_CLASS_NAME}>
            {view.composer.answering !== null ? (
                <div className={GROUP_CHAT_SEND_STATE_CLASS_NAME}>
                    <Text size="xs" tone="accent">
                        {labels.composer.answering(view.composer.answering.moduleName, view.composer.answering.excerpt)}
                    </Text>
                    <Button size="sm" variant="ghost" onPress={on.cancelAnswer}>
                        {labels.composer.cancelAnswer}
                    </Button>
                </div>
            ) : null}
            {view.composer.failure === "retry" ? (
                <div className={GROUP_CHAT_SEND_STATE_CLASS_NAME}>
                    <Text size="xs" live="assertive">
                        {labels.composer.failed}
                    </Text>
                    <Button size="sm" variant="secondary" onPress={on.retrySend}>
                        {labels.composer.retry}
                    </Button>
                </div>
            ) : null}
            {view.composer.failure === "denied" ? (
                <div className={GROUP_CHAT_SEND_STATE_CLASS_NAME}>
                    <Text size="xs" live="assertive">
                        {labels.composer.denied}
                    </Text>
                </div>
            ) : null}
            <form
                className={getGroupChatComposerClassName(compact, decision)}
                onSubmit={(event) => {
                    event.preventDefault()
                    on.sendMessage()
                }}
            >
                <div className={getGroupChatComposerFrameClassName(decision)}>
                    <div className={GROUP_CHAT_COMPOSER_INPUT_CLASS_NAME}>
                        <Input
                            id="collab-composer"
                            name="message"
                            label={<span className={GROUP_CHAT_SR_ONLY_CLASS_NAME}>{labels.composer.label}</span>}
                            placeholder={labels.composer.placeholder}
                            value={view.composer.value}
                            isDisabled={view.composer.pending}
                            onValueChange={on.changeComposer}
                        />
                    </div>
                    <div className={getGroupChatComposerActionsClassName(decision)}>
                        <span className={GROUP_CHAT_COMPOSER_GLYPHS_CLASS_NAME}>
                            <Icon source={IconSource("attachment", "leading")} usage="leading" />
                            <Icon source={IconSource("emoji", "leading")} usage="leading" />
                            <Icon source={IconSource("mention", "leading")} usage="leading" />
                        </span>
                        {decision ? (
                            <IconButton
                                source={IconSource("send", "leading")}
                                label={labels.composer.send}
                                isDisabled={view.composer.value.trim().length === 0 || view.composer.pending}
                                onPress={on.sendMessage}
                            />
                        ) : (
                            <Button
                                type="submit"
                                variant="primary"
                                isPending={view.composer.pending}
                                isDisabled={view.composer.value.trim().length === 0}
                            >
                                <span className={GROUP_CHAT_COMPOSER_SEND_CLASS_NAME}>
                                    <Icon source={IconSource("send", "chip")} usage="chip" /> {labels.composer.send}
                                </span>
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}
