import { Button, Input, Text } from "@starci/grammar/common"
import type { ExecuteChatBlockCopy } from "@/modules/agentos/execute-chat"
import { EXECUTE_CHAT_COMPOSER_CLASS_NAME } from "./classNames"

export type ExecuteChatComposerProps = {
    readonly copy: ExecuteChatBlockCopy
    readonly draft: string
    readonly composerKey: number
    readonly pending: boolean
    readonly refused: boolean
    readonly onDraft: (content: string) => void
    readonly onSubmit: () => void
}

/** Draw the message input and its refusal state. */
export const ExecuteChatComposer = ({
    copy,
    draft,
    composerKey,
    pending,
    refused,
    onDraft,
    onSubmit,
}: ExecuteChatComposerProps) => (
    <div className={EXECUTE_CHAT_COMPOSER_CLASS_NAME}>
        <Input
            key={composerKey}
            id="agentos-execute-message"
            name="executeMessage"
            label={copy.executeChat.messageLabel}
            placeholder={copy.executeChat.placeholder}
            isDisabled={pending}
            variant="secondary"
            onValueChange={onDraft}
        />
        <Button variant="primary" isDisabled={draft.trim().length === 0} isPending={pending} onPress={onSubmit}>
            {copy.executeChat.send}
        </Button>
        {refused ? (
            <Text size="sm" tone="muted" live="assertive">
                {copy.executeChat.refused}
            </Text>
        ) : undefined}
    </div>
)
