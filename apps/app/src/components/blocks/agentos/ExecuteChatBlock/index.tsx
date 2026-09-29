"use client"

import { SurfaceCard } from "@starci/grammar/common"
import { type ExecuteChatBlockProps, type TrustedWidgetRegistry } from "../../../../modules/agentos/execute-chat"
import { useExecuteChatComposer } from "../../../../hooks/agentos/useExecuteChatComposer"
import { ExecuteChatComposer } from "../ExecuteChatComposer"
import { ExecuteChatTranscript } from "../ExecuteChatTranscript"
import { ExecuteChatWidget } from "../ExecuteChatWidget"

export type {
    ChatWidgetAction,
    ChatWidgetPayload,
    ExecuteChatBlockCopy,
    ExecuteChatBlockProps,
    ExecuteMessage,
    TrustedWidgetActionHandler,
    TrustedWidgetComponentProps,
    TrustedWidgetRegistry,
} from "../../../../modules/agentos/execute-chat"

/** Built-in trusted widget ComponentTypes aligned with the backend registry. */
export const DEFAULT_WIDGET_REGISTRY: TrustedWidgetRegistry = {
    "nivo.metric@1.0.0": ExecuteChatWidget,
    "nivo.data-table@1.0.0": ExecuteChatWidget,
    "nivo.timeline@1.0.0": ExecuteChatWidget,
    "nivo.action-form@1.0.0": ExecuteChatWidget,
    "nivo.support-task@1.0.0": ExecuteChatWidget,
    "nivo.finance-approval@1.0.0": ExecuteChatWidget,
    "nivo.calendar-options@1.0.0": ExecuteChatWidget,
    "nivo.knowledge-evidence@1.0.0": ExecuteChatWidget,
}

/** Draw Execute messages and fail-closed widgets through the trusted ComponentType registry. */
export const ExecuteChatBlock = (props: ExecuteChatBlockProps) => {
    const { copy, sessionTitle, messages, pending = false, refused = false, registry, onSend, onWidgetAction } = props
    const { draft, composerKey, setDraft, submit } = useExecuteChatComposer(onSend)
    return (
        <SurfaceCard label={copy.executeChat.title} fact={sessionTitle}>
            <ExecuteChatTranscript
                copy={copy}
                messages={messages}
                registry={registry ?? DEFAULT_WIDGET_REGISTRY}
                onWidgetAction={onWidgetAction}
            />
            <ExecuteChatComposer
                copy={copy}
                draft={draft}
                composerKey={composerKey}
                pending={pending}
                refused={refused}
                onDraft={setDraft}
                onSubmit={submit}
            />
        </SurfaceCard>
    )
}
