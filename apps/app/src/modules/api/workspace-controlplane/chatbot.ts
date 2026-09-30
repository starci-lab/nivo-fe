import { failed, isString, type GraphqlDocument, type Outcome } from "@nivo/api"
import { graphqlFields } from "../graphql"
import {
    BindChatbotChannelDocument,
    ChatbotWorkbenchDocument,
    ReconcileChatbotDeliveryDocument,
    ResolveChatbotHandoffDocument,
    SetChatbotHandoffDocument,
    StartZaloChatbotAuthorizationDocument,
} from "../__generated__/agentos-controlplane"
import type {
    BindChatbotChannelInput,
    BindChatbotChannelMutation,
    ChatbotActionPayload,
    ChatbotWorkbenchQuery,
    ChangeChatbotHandoffInput,
    ReconcileChatbotDeliveryInput,
    ReconcileChatbotDeliveryMutation,
    ResolveChatbotHandoffMutation,
    SetChatbotHandoffMutation,
    StartZaloChatbotAuthorizationInput,
    StartZaloChatbotAuthorizationMutation,
} from "../__generated__/agentos-controlplane"
import { parseChatbotCommandResult, parseChatbotWorkbenchAnswer } from "./payload.guards"

const WORKSPACE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu
const CHATBOT_UNAVAILABLE = (reason: string) =>
    failed("unavailable", { code: "WORKSPACE_CONTROLLER_UNAVAILABLE", reason })

const chatbotRequest = async <TVariables, T>(
    workspaceId: string,
    accessToken: string,
    document: GraphqlDocument<TVariables>,
    variables: TVariables,
    field: string,
    parse: (payload: unknown) => T | null,
): Promise<Outcome<T>> => {
    if (!WORKSPACE_ID.test(workspaceId) || accessToken.length === 0)
        return CHATBOT_UNAVAILABLE("The workspace or the credential is not usable.")
    const answered = await graphqlFields(document, variables, { accessToken })
    if (!answered.ok) {
        const code =
            answered.kind === "refused" || answered.kind === "forbidden"
                ? "WORKSPACE_CONTROLLER_REFUSED"
                : answered.status === null
                  ? "WORKSPACE_CONTROLLER_UNREACHABLE"
                  : "WORKSPACE_CONTROLLER_FAILED"
        return failed(answered.kind, { status: answered.status, code, reason: answered.reason })
    }
    const payload: unknown = answered.data[field]
    const data = parse(payload)
    if (data === null) {
        return failed("unavailable", {
            code: "WORKSPACE_CONTROLLER_FAILED",
            reason: "WORKSPACE_CONTROLLER_FAILED",
        })
    }
    return { ok: true, data }
}

const requiredString = (input: Readonly<Record<string, unknown>>, field: string): string | null => {
    const value = input[field]
    return isString(value) ? value : null
}

const bindRequest = (input: Readonly<Record<string, unknown>>): BindChatbotChannelInput | null => {
    const credentialRef = requiredString(input, "credentialRef")
    const installationId = requiredString(input, "installationId")
    const provider = requiredString(input, "provider")
    const providerAccountId = requiredString(input, "providerAccountId")
    const requestToken = requiredString(input, "requestToken")
    return credentialRef === null || installationId === null || provider === null || providerAccountId === null || requestToken === null
        ? null
        : { credentialRef, installationId, provider, providerAccountId, requestToken }
}

const startZaloRequest = (input: Readonly<Record<string, unknown>>): StartZaloChatbotAuthorizationInput | null => {
    const installationId = requiredString(input, "installationId")
    const requestToken = requiredString(input, "requestToken")
    return installationId === null || requestToken === null ? null : { installationId, requestToken }
}

const handoffRequest = (input: Readonly<Record<string, unknown>>): ChangeChatbotHandoffInput | null => {
    const installationId = requiredString(input, "installationId")
    const conversationId = requiredString(input, "conversationId")
    const requestToken = requiredString(input, "requestToken")
    const authorityEpoch = input.authorityEpoch
    if (
        installationId === null ||
        conversationId === null ||
        requestToken === null ||
        (authorityEpoch !== undefined && typeof authorityEpoch !== "number")
    ) {
        return null
    }
    return {
        installationId,
        conversationId,
        requestToken,
        ...(authorityEpoch === undefined ? {} : { authorityEpoch }),
    }
}

const reconcileRequest = (input: Readonly<Record<string, unknown>>): ReconcileChatbotDeliveryInput | null => {
    const installationId = requiredString(input, "installationId")
    const outboxId = requiredString(input, "providerOutboxId")
    const requestToken = requiredString(input, "requestToken")
    if (installationId === null || outboxId === null || requestToken === null) return null
    return {
        installationId,
        outboxId,
        requestToken,
        terminalState: input.outcome === "delivered" ? "sent" : "failed",
        evidenceRef: `operator://manual-reconciliation/${outboxId}`,
    }
}

/** Read the accepted installation-qualified Chatbot workbench contract. */
export const chatbotWorkbench = (
    _hostname: string,
    workspaceId: string,
    accessToken: string,
    installationId: string,
): Promise<Outcome<ChatbotWorkbenchQuery["chatbotWorkbench"]>> =>
    chatbotRequest(
        workspaceId,
        accessToken,
        ChatbotWorkbenchDocument,
        { request: { installationId } },
        "chatbotWorkbench",
        parseChatbotWorkbenchAnswer,
    )

const mutateChatbot = async <TVariables>(
    workspaceId: string,
    accessToken: string,
    document: GraphqlDocument<TVariables>,
    variables: TVariables,
    field: string,
): Promise<Outcome<ChatbotActionPayload>> =>
    chatbotRequest(workspaceId, accessToken, document, variables, field, parseChatbotCommandResult)

/** Bind an opaque, already-sealed channel reference to one installation. */
export const bindChatbotChannel = async (
    _hostname: string,
    workspaceId: string,
    accessToken: string,
    input: Readonly<Record<string, unknown>>,
): Promise<Outcome<BindChatbotChannelMutation["bindChatbotChannel"]>> => {
    const request = bindRequest(input)
    if (request === null) return CHATBOT_UNAVAILABLE("The channel binding request is not usable.")
    return mutateChatbot(
        workspaceId,
        accessToken,
        BindChatbotChannelDocument,
        { request },
        "bindChatbotChannel",
    )
}

/** Start a one-time Zalo OAuth intent; the browser receives no provider token. */
export const startChatbotZaloOauth = async (
    _hostname: string,
    workspaceId: string,
    accessToken: string,
    input: Readonly<Record<string, unknown>>,
): Promise<Outcome<StartZaloChatbotAuthorizationMutation["startZaloChatbotAuthorization"]>> => {
    const request = startZaloRequest(input)
    if (request === null) return CHATBOT_UNAVAILABLE("The Zalo authorization request is not usable.")
    return mutateChatbot(
        workspaceId,
        accessToken,
        StartZaloChatbotAuthorizationDocument,
        { request },
        "startZaloChatbotAuthorization",
    )
}

/** Fence one conversation into human mode before any later provider start. */
export const setChatbotHandoff = async (
    _hostname: string,
    workspaceId: string,
    accessToken: string,
    input: Readonly<Record<string, unknown>>,
): Promise<Outcome<SetChatbotHandoffMutation["setChatbotHandoff"]>> => {
    const request = handoffRequest(input)
    if (request === null) return CHATBOT_UNAVAILABLE("The handoff request is not usable.")
    return mutateChatbot(workspaceId, accessToken, SetChatbotHandoffDocument, { request }, "setChatbotHandoff")
}

/** Resolve human mode only through the installation-qualified authority command. */
export const resolveChatbotHandoff = async (
    _hostname: string,
    workspaceId: string,
    accessToken: string,
    input: Readonly<Record<string, unknown>>,
): Promise<Outcome<ResolveChatbotHandoffMutation["resolveChatbotHandoff"]>> => {
    const request = handoffRequest(input)
    if (request === null) return CHATBOT_UNAVAILABLE("The handoff request is not usable.")
    return mutateChatbot(
        workspaceId,
        accessToken,
        ResolveChatbotHandoffDocument,
        { request },
        "resolveChatbotHandoff",
    )
}

/** Reconcile ambiguous delivery evidence without issuing a blind resend. */
export const reconcileChatbotDelivery = async (
    _hostname: string,
    workspaceId: string,
    accessToken: string,
    input: Readonly<Record<string, unknown>>,
): Promise<Outcome<ReconcileChatbotDeliveryMutation["reconcileChatbotDelivery"]>> => {
    const request = reconcileRequest(input)
    if (request === null) return CHATBOT_UNAVAILABLE("The delivery reconciliation request is not usable.")
    return mutateChatbot(
        workspaceId,
        accessToken,
        ReconcileChatbotDeliveryDocument,
        { request },
        "reconcileChatbotDelivery",
    )
}
