"use client"

import { useCallback, useState } from "react"
import {
    useMutateReconcileChatbotDeliverySwr,
    useMutateResolveChatbotHandoffSwr,
    useMutateSetChatbotHandoffSwr,
    useMutateStartChatbotZaloOauthSwr,
} from "../swr/mutations/workspace-controlplane"
import { useQueryChatbotWorkbenchSwr, type SupportQueryIdentity } from "../swr/queries/useQueryChatbotWorkbenchSwr"
import type { AgentosModuleRuntime } from "@/modules/api/agentos-module-runtime"
import type { AgentosRuntimeValue } from "@/modules/api/agentos-runtime-tree"
import { nivoQueryPayload } from "@/modules/query"
import type { OperateSurfaceProps } from "@/modules/agentos/module-page/surface-types"
import { executeSessionIdFor } from "@/modules/agentos/module-page/sessions"
import { selectedIdentity } from "@/modules/agentos/module-page/runtime-values"
import { idempotencyKey, type ModuleRuntimeControls } from "./agentos.shared"

/** The runtime, the chatbot identity and the shared commands the operate surface connects. */
export interface ModuleOperateInput {
    readonly installationId: string
    readonly runtime: AgentosModuleRuntime | null
    readonly chatbotIdentity: SupportQueryIdentity
    readonly controls: ModuleRuntimeControls
}

/**
 * Own the operate pane: which execute session and support conversation are selected, the session
 * create/send commands, widget invocations and the chatbot inbox actions.
 *
 * SELECTIONS ARE DERIVED, NOT CORRECTED. A stale session or conversation identity falls back to the
 * runtime's own during render, so no effect mirrors the projection back into state.
 */
export const useModuleOperate = (input: ModuleOperateInput) => {
    const { installationId, runtime, chatbotIdentity, controls } = input
    const { perform, settleRuntime } = controls
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
    const [selectedSupportConversationId, setSelectedSupportConversationId] = useState<string | null>(null)
    const [supportActionPending, setSupportActionPending] = useState(false)
    const [supportActionRefused, setSupportActionRefused] = useState(false)
    const [selectedOperationTarget, setSelectedOperationTarget] =
        useState<OperateSurfaceProps["operationTarget"] | null>(null)

    const chatbotQuery = useQueryChatbotWorkbenchSwr(chatbotIdentity)
    const startZaloOauthMutation = useMutateStartChatbotZaloOauthSwr(chatbotIdentity)
    const setChatbotHandoffMutation = useMutateSetChatbotHandoffSwr(chatbotIdentity)
    const resolveChatbotHandoffMutation = useMutateResolveChatbotHandoffSwr(chatbotIdentity)
    const reconcileChatbotDeliveryMutation = useMutateReconcileChatbotDeliverySwr(chatbotIdentity)

    const chatbotWorkbench = nivoQueryPayload(chatbotQuery.data) ?? null
    const chatbotRefusedCode = chatbotQuery.data?.ok === false ? chatbotQuery.data.code : null
    const effectiveSessionId =
        runtime === null ? null : executeSessionIdFor(runtime, selectedSessionId)
    const effectiveSupportConversationId = selectedIdentity(
        chatbotWorkbench?.conversations ?? [],
        selectedSupportConversationId,
    )
    const supportPending = supportActionPending || chatbotQuery.isLoading
    const runtimeMessages = runtime?.messages
    const runtimeExecuteSessions = runtime?.executeSessions

    const createExecuteSession = useCallback(async (): Promise<string | null> => {
        const existingIds = new Set(runtimeExecuteSessions?.map((session) => session.id) ?? [])
        const nextRuntime = await perform({
            action: "CREATE_EXECUTE_SESSION",
            installationId,
            idempotencyKey: idempotencyKey(),
            title: `Conversation ${(runtimeExecuteSessions?.length ?? 0) + 1}`,
        })
        return nextRuntime?.executeSessions.find((session) => !existingIds.has(session.id))?.id ?? null
    }, [installationId, perform, runtimeExecuteSessions])
    const sendExecuteMessage = useCallback(
        async (sessionId: string, content: string) => {
            const assistantCount =
                runtimeMessages?.filter((message) => message.sessionId === sessionId && message.role === "assistant")
                    .length ?? 0
            const appended = await perform({
                action: "APPEND_EXECUTE_MESSAGE",
                installationId,
                sessionId,
                idempotencyKey: idempotencyKey(),
                content,
            })
            if (appended === null) return
            await settleRuntime(
                (candidate) =>
                    candidate.messages.filter(
                        (message) => message.sessionId === sessionId && message.role === "assistant",
                    ).length > assistantCount,
            )
        },
        [installationId, perform, settleRuntime, runtimeMessages],
    )
    const invokeWidgetAction = useCallback(
        (
            widgetId: string,
            widgetAction: string,
            widgetInput: Readonly<Record<string, AgentosRuntimeValue>>,
            taskExpectedVersion?: number,
        ) => {
            void perform({
                action: "INVOKE_WIDGET_ACTION",
                installationId,
                idempotencyKey: idempotencyKey(),
                widgetId,
                widgetAction,
                widgetInput,
                taskExpectedVersion,
            })
        },
        [installationId, perform],
    )
    const runSupportAction = useCallback(
        async (
            action: () => Promise<{
                readonly ok: boolean
            }>,
        ) => {
            setSupportActionPending(true)
            const result = await action()
            setSupportActionPending(false)
            setSupportActionRefused(!result.ok)
        },
        [],
    )
    const connectChatbotZalo = useCallback(() => {
        void runSupportAction(async () => {
            const answer = await startZaloOauthMutation.trigger({ installationId, requestToken: idempotencyKey() })
            if (answer.ok && answer.data.authorizationUrl !== null && answer.data.authorizationUrl !== undefined) {
                const authorization = new URL(answer.data.authorizationUrl)
                if (authorization.protocol === "https:" && authorization.hostname === "oauth.zaloapp.com")
                    window.open(
                        authorization.toString(),
                        "chatbot-zalo-oauth",
                        "popup,width=520,height=720,noopener,noreferrer",
                    )
            }
            return answer
        })
    }, [installationId, runSupportAction, startZaloOauthMutation])
    const setChatbotHandoff = useCallback(
        (conversationId: string) => {
            void runSupportAction(() =>
                setChatbotHandoffMutation.trigger({ installationId, conversationId, requestToken: idempotencyKey() }),
            )
        },
        [installationId, runSupportAction, setChatbotHandoffMutation],
    )
    const resolveChatbotHandoff = (conversationId: string) => {
        const conversation = chatbotWorkbench?.conversations.find((candidate) => candidate.id === conversationId)
        if (conversation !== undefined)
            void runSupportAction(() =>
                resolveChatbotHandoffMutation.trigger({
                    installationId,
                    conversationId,
                    requestToken: idempotencyKey(),
                    authorityEpoch: conversation.authorityEpoch,
                }),
            )
    }
    const reconcileChatbotDelivery = useCallback(
        (providerOutboxId: string, delivered: boolean) => {
            void runSupportAction(() =>
                reconcileChatbotDeliveryMutation.trigger({
                    installationId,
                    providerOutboxId,
                    outcome: delivered ? "delivered" : "failed",
                    requestToken: idempotencyKey(),
                }),
            )
        },
        [installationId, reconcileChatbotDeliveryMutation, runSupportAction],
    )

    return {
        selectedSessionId: effectiveSessionId,
        supportConversationId: effectiveSupportConversationId,
        chatbotWorkbench,
        chatbotRefusedCode: chatbotRefusedCode ?? (supportActionRefused ? "CHATBOT_ACTION_REFUSED" : null),
        supportPending,
        operationTarget: selectedOperationTarget ?? "internal-chat",
        createExecuteSession,
        sendExecuteMessage,
        invokeWidgetAction,
        connectChatbotZalo,
        setChatbotHandoff,
        resolveChatbotHandoff,
        reconcileChatbotDelivery,
        selectSession: setSelectedSessionId,
        selectSupportConversation: setSelectedSupportConversationId,
        selectTarget: setSelectedOperationTarget,
    }
}
