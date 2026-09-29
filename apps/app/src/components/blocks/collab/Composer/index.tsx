import type { GroupChatPageLabels, GroupChatPageView, GroupChatPageActions } from "../../../../modules/collab/group-chat/types"
import {
    GROUP_CHAT_FIELD_BODY_CLASS_NAME,
    getGroupChatComposerClassName,
    getGroupChatComposerFrameClassName,
    GROUP_CHAT_COMPOSER_INPUT_CLASS_NAME,
    getGroupChatComposerActionsClassName,
    GROUP_CHAT_COMPOSER_GLYPHS_CLASS_NAME,
    GROUP_CHAT_COMPOSER_SEND_CLASS_NAME,
    GROUP_CHAT_COMPOSER_GLYPH_CLASS_NAME,
    GROUP_CHAT_SEND_STATE_CLASS_NAME,
    GROUP_CHAT_SR_ONLY_CLASS_NAME,
} from "./classNames"
import { Icon, IconButton, Input, Text } from "@starci/grammar/common"
import { IconSource } from "@nivo/ui"
import { Button } from "@starci/grammar/common"

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
                        <span className={GROUP_CHAT_COMPOSER_GLYPHS_CLASS_NAME} aria-hidden="true">
                            <svg
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={GROUP_CHAT_COMPOSER_GLYPH_CLASS_NAME}
                            >
                                <path
                                    d="M13.6 6.3 7.2 12.7a1.7 1.7 0 0 0 2.4 2.4l6.6-6.6a3.3 3.3 0 0 0-4.7-4.7L4.6 10.7a4.9 4.9 0 0 0 6.9 6.9l5.3-5.3"
                                    stroke="currentColor"
                                    strokeWidth={1.4}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <svg
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={GROUP_CHAT_COMPOSER_GLYPH_CLASS_NAME}
                            >
                                <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth={1.4} />
                                <path
                                    d="M7.2 12c.7.9 1.6 1.4 2.8 1.4s2.1-.5 2.8-1.4"
                                    stroke="currentColor"
                                    strokeWidth={1.4}
                                    strokeLinecap="round"
                                />
                                <circle cx="7.7" cy="8.3" r=".9" fill="currentColor" />
                                <circle cx="12.3" cy="8.3" r=".9" fill="currentColor" />
                            </svg>
                            <span className={GROUP_CHAT_COMPOSER_GLYPH_CLASS_NAME}>
                                <svg
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={GROUP_CHAT_COMPOSER_GLYPH_CLASS_NAME}
                                >
                                    <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth={1.4} />
                                    <path
                                        d="M12.6 11.6a2.9 2.9 0 1 1 .1-2.4v3.6a1.3 1.3 0 0 1-2.6 0V8.9"
                                        stroke="currentColor"
                                        strokeWidth={1.4}
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
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
