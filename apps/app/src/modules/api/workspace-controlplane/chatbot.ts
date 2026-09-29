import { graphqlFields } from "../graphql"
import { failed, type Outcome } from "../outcome"
import { isRecord } from "../wire"
import { parseChatbotCommandResult, parseChatbotWorkbenchAnswer } from "./payload.guards"
/** A channel binding safe to display without exposing provider credentials. */
export type ChatbotChannelBinding = {
    readonly id: string
    readonly installationId: string
    readonly provider: "telegram" | "zalo" | string
    readonly accountRef: string
    readonly state: string
    readonly credentialRef: string | null
}

/** One conversation owned by exactly one Chatbot installation. */
export type ChatbotConversation = {
    readonly id: string
    readonly installationId: string
    readonly participantRef: string
    readonly handoffState: string
    readonly authorityEpoch: number
    readonly approvedVersion: number | null
    readonly lastMessageAt: string
}

/** Truthful recorded delivery state; ambiguous is never treated as sent. */
export type ChatbotMessage = {
    readonly id: string
    readonly conversationId: string
    readonly direction: string
    readonly sequence: string
    readonly body: string
    readonly deliveryState: string
    readonly providerOutboxId: string | null
    readonly failureCode: string | null
    readonly occurredAt: string
}

/** Complete read model for one installed Chatbot workbench. */
export type ChatbotWorkbench = {
    readonly installationId: string
    readonly lifecycleState: string
    readonly approvedVersion: number | null
    readonly channels: ReadonlyArray<ChatbotChannelBinding>
    readonly conversations: ReadonlyArray<ChatbotConversation>
    readonly messages: ReadonlyArray<ChatbotMessage>
}

/** Stable command result returned after installation-scoped readback. */
export type ChatbotCommandResult = {
    readonly id: string
    readonly installationId: string
    readonly state: string
    readonly authorizationUrl?: string | null
}
const WORKSPACE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu
type ChatbotCoreOperation =
    "workbench" | "bind-channel" | "start-zalo-oauth" | "set-handoff" | "resolve-handoff" | "reconcile-delivery"
const CHATBOT_UNAVAILABLE = (reason: string) =>
    failed("unavailable", { code: "WORKSPACE_CONTROLLER_UNAVAILABLE", reason })

/*
 * The Chatbot boundary keeps three refusal codes a screen may key on: REFUSED (the session was not
 * accepted or may not do this), UNREACHABLE (no reply arrived) and FAILED (a reply arrived and was
 * not an answer). The kind and status of the failure travel beside them.
 */
const chatbotCoreRequest = async <T>(
    workspaceId: string,
    accessToken: string,
    installationId: string,
    operation: ChatbotCoreOperation,
    input: Readonly<Record<string, unknown>> | undefined,
    parse: (payload: unknown) => T | null,
): Promise<Outcome<T>> => {
    if (!WORKSPACE_ID.test(workspaceId) || accessToken.length === 0)
        return CHATBOT_UNAVAILABLE("The workspace or the credential is not usable.")
    const read = operation === "workbench"
    const field = read ? "chatbotWorkspaceWorkbench" : "chatbotWorkspaceCommand"
    const answered = await graphqlFields(
        `${read ? "query" : "mutation"} ChatbotWorkspaceGateway($request: ${read ? "ChatbotWorkspaceReadRequest" : "ChatbotWorkspaceCommandRequest"}!) { ${field}(request: $request) }`,
        { request: { workspaceId, installationId, ...(read ? {} : { operation, input: input ?? {} }) } },
        { accessToken },
    )
    if (!answered.ok) {
        const code =
            answered.kind === "refused" || answered.kind === "forbidden"
                ? "WORKSPACE_CONTROLLER_REFUSED"
                : answered.status === null
                  ? "WORKSPACE_CONTROLLER_UNREACHABLE"
                  : "WORKSPACE_CONTROLLER_FAILED"
        return failed(answered.kind, { status: answered.status, code, reason: answered.reason })
    }
    const envelope: unknown = answered.data[field]
    const errors = isRecord(envelope) ? envelope.errors : undefined
    if (!isRecord(envelope) || envelope.data === undefined || (Array.isArray(errors) && errors.length > 0)) {
        return failed("unavailable", {
            code: "WORKSPACE_CONTROLLER_FAILED",
            reason: "The controller answered without a payload.",
        })
    }
    const data = parse(envelope.data)
    if (data === null) {
        return failed("unavailable", {
            code: "WORKSPACE_CONTROLLER_FAILED",
            reason: "The controller answered without a payload.",
        })
    }
    return { ok: true, data }
}

/** Read the accepted installation-qualified Chatbot workbench contract. */
export const chatbotWorkbench = async (
    _hostname: string,
    workspaceId: string,
    accessToken: string,
    installationId: string,
): Promise<Outcome<ChatbotWorkbench>> => {
    return chatbotCoreRequest<ChatbotWorkbench>(
        workspaceId,
        accessToken,
        installationId,
        "workbench",
        undefined,
        parseChatbotWorkbenchAnswer,
    )
}

const mutateChatbot = async (
    workspaceId: string,
    accessToken: string,
    installationId: string,
    operation: ChatbotCoreOperation,
    input: Readonly<Record<string, unknown>>,
    field: string,
): Promise<Outcome<ChatbotCommandResult>> => {
    const result = await chatbotCoreRequest<ChatbotCommandResult>(
        workspaceId,
        accessToken,
        installationId,
        operation,
        input,
        (payload) => (isRecord(payload) ? parseChatbotCommandResult(payload[field]) : null),
    )
    return result
}

/** Bind an opaque, already-sealed channel reference to one installation. */
export const bindChatbotChannel = (
    _hostname: string,
    workspaceId: string,
    accessToken: string,
    input: Readonly<Record<string, unknown>>,
) =>
    mutateChatbot(
        workspaceId,
        accessToken,
        String(input.installationId ?? ""),
        "bind-channel",
        input,
        "bindChatbotChannel",
    )

/** Start a one-time Zalo OAuth intent; the browser receives no provider token. */
export const startChatbotZaloOauth = (
    _hostname: string,
    workspaceId: string,
    accessToken: string,
    input: Readonly<Record<string, unknown>>,
) =>
    mutateChatbot(
        workspaceId,
        accessToken,
        String(input.installationId ?? ""),
        "start-zalo-oauth",
        input,
        "startZaloChatbotAuthorization",
    )

/** Fence one conversation into human mode before any later provider start. */
export const setChatbotHandoff = (
    _hostname: string,
    workspaceId: string,
    accessToken: string,
    input: Readonly<Record<string, unknown>>,
) =>
    mutateChatbot(
        workspaceId,
        accessToken,
        String(input.installationId ?? ""),
        "set-handoff",
        input,
        "setChatbotHandoff",
    )

/** Resolve human mode only through the installation-qualified authority command. */
export const resolveChatbotHandoff = (
    _hostname: string,
    workspaceId: string,
    accessToken: string,
    input: Readonly<Record<string, unknown>>,
) =>
    mutateChatbot(
        workspaceId,
        accessToken,
        String(input.installationId ?? ""),
        "resolve-handoff",
        input,
        "resolveChatbotHandoff",
    )

/** Reconcile ambiguous delivery evidence without issuing a blind resend. */
export const reconcileChatbotDelivery = (
    _hostname: string,
    workspaceId: string,
    accessToken: string,
    input: Readonly<Record<string, unknown>>,
) =>
    mutateChatbot(
        workspaceId,
        accessToken,
        String(input.installationId ?? ""),
        "reconcile-delivery",
        {
            ...input,
            outboxId: input.providerOutboxId,
            terminalState: input.outcome === "delivered" ? "sent" : "failed",
            evidenceRef: `operator://manual-reconciliation/${String(input.providerOutboxId)}`,
            providerOutboxId: undefined,
            outcome: undefined,
        },
        "reconcileChatbotDelivery",
    )

/*
 * Workspace purchase boundary (contract.workspace-provision.workspace-checkout and
 * contract.workspace-provision.purchased-workspace-entry).
 *
 * THE DEDICATED WORKSPACE-PROVISION MODULE HAS NO PUBLISHED GRAPHQL SURFACE YET, so each contract
 * operation is bound to the current owned capability the SDS already names for it: a
 * `catalog_orders` row is the purchase identity, its invoice is the billing fact, the
 * `agent_workspaces` row keyed on that order is the provisioning/readiness fact, a provisioning
 * saga is the durable step record, and an instance-management app launch is the workspace entry
 * grant. When the feature surface ships, only these bindings move - the exported vocabulary stays.
 *
 * NO READ BELOW INFERS A STATE THE WIRE DID NOT RETURN. A missing invoice is "not-raised", a
 * refused source is "unavailable", a missing workspace is "not-admitted", and only a persisted
 * `paid` invoice reports paid. Browser redirects, provider acceptance pages, local state and
 * elapsed time never enter these results, so a screen cannot mistake them for a fact.
 *
 * RESULTS CARRY THE REFUSAL SENTENCE, NOT JUST A CODE. The purchase screens owe the reader the
 * server's own words, so this section returns the transport's `Outcome`, reason included.
 */

/** One currently published workspace offer; the catalog row IS the offer the contract names. */
