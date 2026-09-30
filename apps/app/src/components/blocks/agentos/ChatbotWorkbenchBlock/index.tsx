"use client"

import { useFormatter } from "next-intl"
import { useState } from "react"
import type { ChatbotWorkbench } from "@/modules/api/workspace-controlplane"
import type { Formatter } from "../../../../modules/i18n/formatter"
import { ChatbotWorkbenchBlockBase, type ChatbotWorkbenchBlockBaseCopy } from "./component"

/** Localized copy for the installed Chatbot workbench, including the version line's two forms. */
export type ChatbotWorkbenchBlockCopy = ChatbotWorkbenchBlockBaseCopy & {
    readonly approvedVersion: (version: string) => string
    readonly noApprovedVersion: string
}

/** Installation-qualified state and actions for the workbench surface. */
type ChatbotWorkbenchBlockProps = {
    readonly installationId: string
    readonly workbench: ChatbotWorkbench | null
    readonly selectedConversationId: string | null
    readonly pending: boolean
    readonly refusedCode: string | null
    readonly copy: ChatbotWorkbenchBlockCopy
    readonly onSelectConversation: (conversationId: string) => void
    readonly onConnectZalo: () => void
    readonly onSetHandoff: (conversationId: string) => void
    readonly onResolveHandoff: (conversationId: string) => void
    readonly onReconcile: (providerOutboxId: string, delivered: boolean) => void
}

/** Own the rail disclosure, the locale formatter and the version line, then draw the pure workbench. */
export const ChatbotWorkbenchBlock = (props: ChatbotWorkbenchBlockProps) => {
    const format: Formatter = useFormatter()
    const [isRailOpen, setRailOpen] = useState(false)
    const { workbench, copy } = props
    const { approvedVersion, noApprovedVersion, ...baseCopy } = copy
    const versionLabel =
        workbench === null || workbench.approvedVersion === null
            ? noApprovedVersion
            : approvedVersion(String(workbench.approvedVersion))
    return (
        <ChatbotWorkbenchBlockBase
            state={{ isRailOpen }}
            props={{
                installationId: props.installationId,
                workbench,
                selectedConversationId: props.selectedConversationId,
                pending: props.pending,
                refusedCode: props.refusedCode,
                copy: baseCopy,
                versionLabel,
                format,
            }}
            on={{
                selectConversation: props.onSelectConversation,
                connectZalo: props.onConnectZalo,
                setHandoff: props.onSetHandoff,
                resolveHandoff: props.onResolveHandoff,
                reconcile: props.onReconcile,
                setRailOpen,
            }}
        />
    )
}
