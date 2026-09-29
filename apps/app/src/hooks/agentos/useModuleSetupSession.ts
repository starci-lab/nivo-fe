"use client"

import { useCallback, useRef, useState } from "react"
import type { AgentosModuleRuntime } from "../../modules/api/agentos-module-runtime"
import { setupSessionFor } from "../../modules/agentos/module-page/setup-draft"
import {
    confirmationEvidence,
    idempotencyKey,
    type IndexedSourceAttachment,
    type ModuleRuntimeControls,
} from "./agentos.shared"

type SetupAction = { readonly kind: "send" | "apply" | "confirm"; readonly sessionId: string } | { readonly kind: "start" }
type SetupFeedback = { readonly refused?: "send" | "apply"; readonly unconfirmed?: boolean }
/** The runtime state and shared commands the setup session state machine connects. */
export interface ModuleSetupSessionInput {
    readonly installationId: string
    readonly runtime: AgentosModuleRuntime | null
    readonly controls: ModuleRuntimeControls
}

/**
 * Own the setup session state machine: which revision the owner talks to, the per-session drafts
 * and feedback, and the send/apply/confirm commands. `selectedSetup` is derived during render so
 * no effect mirrors the runtime into state; the one-lock gate serializes setup commands.
 */
export const useModuleSetupSession = (input: ModuleSetupSessionInput) => {
    const { installationId, runtime, controls } = input
    const { pending, perform, settleRuntime } = controls
    const [selectedSetupSessionId, setSelectedSetupSessionId] = useState<string | null>(null)
    const [setupDrafts, setSetupDrafts] = useState<Record<string, string>>({})
    const [setupAction, setSetupAction] = useState<SetupAction | null>(null)
    const [setupFeedback, setSetupFeedback] = useState<Record<string, SetupFeedback>>({})
    const [setupStartRefused, setSetupStartRefused] = useState(false)
    const [indexedSourceAttachments, setIndexedSourceAttachments] = useState<ReadonlyArray<IndexedSourceAttachment>>([])
    const setupLock = useRef(false)

    const selectedSetup = runtime === null ? null : setupSessionFor(runtime, selectedSetupSessionId)
    const selectedSetupFeedback = setupFeedback[selectedSetup?.id ?? ""]
    const ownsSetupAction =
        setupAction !== null && setupAction.kind !== "start" && setupAction.sessionId === selectedSetup?.id

    const startSetupRevision = useCallback(() => {
        if (setupLock.current || pending) return
        setupLock.current = true
        setSetupAction({ kind: "start" })
        setSetupStartRefused(false)
        void perform(
            {
                action: "START_SETUP_REVISION",
                installationId,
                idempotencyKey: idempotencyKey(),
                title: "Setup revision",
            },
            false,
        ).then((result) => {
            if (result === null) setSetupStartRefused(true)
            else {
                const newId = result.setupSession?.id
                if (newId !== undefined && result.setupSessions.some((session) => session.id === newId)) {
                    setSelectedSetupSessionId(newId)
                    setSetupFeedback((current) => ({ ...current, [newId]: {} }))
                }
            }
            setSetupAction(null)
            setupLock.current = false
        })
    }, [installationId, perform, pending])
    const sendSetupMessage = useCallback(
        async (sessionId: string, content: string) => {
            if (setupLock.current || pending) return
            setupLock.current = true
            setSetupAction({ kind: "send", sessionId })
            setSetupFeedback((current) => ({ ...current, [sessionId]: {} }))
            const assistantCount =
                runtime?.messages.filter((message) => message.sessionId === sessionId && message.role === "assistant")
                    .length ?? 0
            const priorDigest =
                runtime?.setupSessions.find((session) => session.id === sessionId)?.draftDigest ?? null
            const appended = await perform(
                {
                    action: "APPEND_SETUP_MESSAGE",
                    installationId,
                    idempotencyKey: idempotencyKey(),
                    sessionId,
                    content,
                },
                false,
            )
            if (appended === null) {
                setSetupFeedback((current) => ({ ...current, [sessionId]: { refused: "send" } }))
                setSetupAction(null)
                setupLock.current = false
                return
            }
            setSetupDrafts((current) => ({ ...current, [sessionId]: "" }))
            const settled = await settleRuntime((candidate) => {
                const nextAssistantCount = candidate.messages.filter(
                    (message) => message.sessionId === sessionId && message.role === "assistant",
                ).length
                const setup = candidate.setupSessions.find((session) => session.id === sessionId)
                return (
                    nextAssistantCount > assistantCount ||
                    setup?.draftDigest !== priorDigest ||
                    setup?.setupStatus === "completed"
                )
            }, false)
            if (settled === null) setSetupFeedback((current) => ({ ...current, [sessionId]: { unconfirmed: true } }))
            setSetupAction(null)
            setupLock.current = false
        },
        [installationId, perform, settleRuntime, runtime?.messages, runtime?.setupSessions, pending],
    )
    const runRevisionCommand = useCallback(
        (action: "APPLY_SETUP_REVISION" | "REVISE_CONTEXT", sessionId: string) => {
            if (setupLock.current || pending) return
            setupLock.current = true
            setSetupAction({ kind: "apply", sessionId })
            setSetupFeedback((current) => ({ ...current, [sessionId]: {} }))
            void perform(
                {
                    action,
                    installationId,
                    idempotencyKey: idempotencyKey(),
                    sessionId,
                },
                false,
            ).then((result) => {
                if (result === null) setSetupFeedback((current) => ({ ...current, [sessionId]: { refused: "apply" } }))
                setSetupAction(null)
                setupLock.current = false
            })
        },
        [installationId, perform, pending],
    )
    const applySetupRevision = useCallback(
        (sessionId: string) => runRevisionCommand("APPLY_SETUP_REVISION", sessionId),
        [runRevisionCommand],
    )
    const createContextVersion = useCallback(
        (sessionId: string) => runRevisionCommand("REVISE_CONTEXT", sessionId),
        [runRevisionCommand],
    )
    const confirmSetupRequirement = useCallback(
        async (
            sessionId: string,
            draftDigest: string,
            requirementKey: string,
            citationPolicy: "none" | "attachment-content",
        ) => {
            if (setupLock.current || pending) return
            setupLock.current = true
            setSetupAction({ kind: "confirm", sessionId })
            const { citations, evidenceDigest } = await confirmationEvidence(
                draftDigest,
                requirementKey,
                citationPolicy,
                indexedSourceAttachments,
            )
            await perform({
                action: "CONFIRM_SETUP_REQUIREMENT",
                installationId,
                idempotencyKey: idempotencyKey(),
                sessionId,
                requirementKey,
                expectedDraftDigest: draftDigest,
                evidenceDigest,
                citations,
            })
            setSetupAction(null)
            setupLock.current = false
        },
        [indexedSourceAttachments, installationId, perform, pending],
    )

    return {
        selectedSetup,
        sendPending: ownsSetupAction && setupAction?.kind === "send",
        applyPending: ownsSetupAction && setupAction?.kind === "apply",
        startPending: setupAction?.kind === "start",
        peerDisabled: (pending || setupAction !== null) && !ownsSetupAction,
        sendRefused: selectedSetupFeedback?.refused === "send",
        applyRefused: selectedSetupFeedback?.refused === "apply",
        startRefused: setupStartRefused,
        unconfirmed: selectedSetupFeedback?.unconfirmed ?? false,
        draftText: setupDrafts[selectedSetup?.id ?? ""] ?? "",
        updateIndexedSourceAttachments: (attachments: ReadonlyArray<IndexedSourceAttachment>) =>
            setIndexedSourceAttachments((current) =>
                JSON.stringify(current) === JSON.stringify(attachments) ? current : attachments,
            ),
        selectRevision: setSelectedSetupSessionId,
        startRevision: startSetupRevision,
        sendMessage: sendSetupMessage,
        changeDraft: (sessionId: string, content: string) =>
            setSetupDrafts((current) => ({ ...current, [sessionId]: content })),
        applyRevision: applySetupRevision,
        createContextVersion,
        confirmRequirement: confirmSetupRequirement,
    }
}
