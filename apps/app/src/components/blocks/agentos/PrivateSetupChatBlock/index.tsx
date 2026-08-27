"use client"

import { useState } from "react"
import {
    Button, ChoiceTabs, Field, SurfaceCard, Text, Tree,
    defineContractComponent, defineContractProjection, defineLeafComponent,
} from "@nivo/ui"

/** One accepted turn in the installation's private resumable Setup session. */
export type SetupMessage = {
    readonly id: string
    readonly role: "user" | "assistant" | "system"
    readonly content: string
}

/** One immutable or resumable Setup revision identity visible only to the owner. */
export type SetupRevision = {
    readonly id: string
    readonly revision: number
    readonly status: "open" | "ready" | "completed" | "superseded"
}

/** Runtime data passed through the typed Setup chat body component. */
export type PrivateSetupChatContentProps = {
    readonly messages: ReadonlyArray<SetupMessage>
    readonly draft: string
    readonly composerKey: number
    readonly pending: boolean
    readonly refused: boolean
    readonly revisions: ReadonlyArray<SetupRevision>
    readonly selectedRevisionId: string
    readonly canSend: boolean
    readonly canStartRevision: boolean
    readonly showRevisionControls: boolean
    readonly onDraft: (content: string) => void
    readonly onSubmit: () => void
    readonly onSelectRevision: (sessionId: string) => void
    readonly onStartRevision: () => void
}

/** Public Setup chat boundary; Execute histories are intentionally absent. */
export type PrivateSetupChatBlockProps = {
    readonly messages: ReadonlyArray<SetupMessage>
    readonly pending?: boolean
    readonly refused?: boolean
    readonly revisions: ReadonlyArray<SetupRevision>
    readonly selectedRevisionId: string
    readonly canSend: boolean
    readonly canStartRevision: boolean
    readonly showRevisionControls?: boolean
    readonly onSelectRevision: (sessionId: string) => void
    readonly onStartRevision: () => void
    readonly onSend: (content: string) => void
}

const actorLabel = (role: SetupMessage["role"]): string => {
    if (role === "user") return "You"
    if (role === "assistant") return "Nivo AI"
    return "System"
}

const PrivateSetupChatContent = ({
    messages, draft, composerKey, pending, refused, revisions, selectedRevisionId, canSend, canStartRevision, showRevisionControls,
    onDraft, onSubmit, onSelectRevision, onStartRevision,
}: PrivateSetupChatContentProps) => (
    <Tree contract="agentos-chat-body" render={defineContractComponent("agentos-chat-body", {
        session: !showRevisionControls || revisions.length < 2 ? undefined : defineLeafComponent("choice-tabs", {}, () => (
            <ChoiceTabs
                props={{
                    label: "Setup revisions",
                    selectedKey: selectedRevisionId,
                    tabs: revisions.map((revision) => ({ id: revision.id, label: `r${revision.revision} · ${revision.status}` })),
                }}
                on={{ select: onSelectRevision }}
            />
        )),
        message: messages.map((message) => defineContractComponent("module-interview-message", {
            actor: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: actorLabel(message.role), size: "xs", tone: "muted", weight: "semibold" }} />
            )),
            content: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: message.content, size: "sm" }} />
            )),
        })),
        composer: canSend ? defineContractComponent("form-column", {
            field: [defineContractProjection("label-field-hint", () => (
                <Field
                    key={composerKey}
                    props={{
                        id: "agentos-private-setup-message",
                        name: "setupMessage",
                        label: "Teach this module about your business",
                        placeholder: "Describe priorities, policies, or exceptions…",
                        disabled: pending,
                    }}
                    on={{ change: onDraft }}
                />
            ))],
            submit: defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: "Send", variant: "primary", disabled: draft.trim().length === 0, isPending: pending }}
                    on={{ press: onSubmit }}
                />
            )),
        }) : undefined,
        action: showRevisionControls && canStartRevision ? defineLeafComponent("button", {}, () => (
            <Button props={{ label: "Start new AI Setup chat", variant: "secondary", isPending: pending }} on={{ press: onStartRevision }} />
        )) : undefined,
        notice: refused
            ? defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: "Setup message was refused. Nothing was added to the context draft.", size: "sm", tone: "muted", live: "assertive" }} />
            ))
            : canStartRevision
                ? defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text
                        props={{
                            content: "This Setup revision is complete. Start a new private AI chat to revise the business context; the active version stays unchanged until Test and Apply pass.",
                            size: "sm",
                            tone: "muted",
                        }}
                    />
                ))
                : undefined,
    })} />
)

const PRIVATE_SETUP_CHAT_CONTENT = defineContractComponent("agentos-chat-body", PrivateSetupChatContent)

/** Draw the private context-building conversation through one runtime ComponentType and Tree. */
export const PrivateSetupChatBlock = ({
    messages, pending = false, refused = false, revisions, selectedRevisionId, canSend, canStartRevision, showRevisionControls = true,
    onSelectRevision, onStartRevision, onSend,
}: PrivateSetupChatBlockProps) => {
    const [draft, setDraft] = useState("")
    const [composerKey, setComposerKey] = useState(0)
    const submit = () => {
        const content = draft.trim()
        if (content.length === 0) return
        onSend(content)
        setDraft("")
        setComposerKey((current) => current + 1)
    }
    return (
        <SurfaceCard
            props={{
                label: "Private Setup chat",
                fact: revisions.find((revision) => revision.id === selectedRevisionId) === undefined
                    ? "Setup only"
                    : `r${revisions.find((revision) => revision.id === selectedRevisionId)?.revision} · ${revisions.find((revision) => revision.id === selectedRevisionId)?.status}`,
            }}
            contract="agentos-chat-body"
            render={PRIVATE_SETUP_CHAT_CONTENT}
            contentProps={{
                messages, draft, composerKey, pending, refused, revisions, selectedRevisionId, canSend, canStartRevision, showRevisionControls,
                onDraft: setDraft, onSubmit: submit, onSelectRevision, onStartRevision,
            }}
        />
    )
}

/** Source-level tier marker for the pure private Setup chat block. */
export const meta = { shape: "block", world: "pure" } as const
