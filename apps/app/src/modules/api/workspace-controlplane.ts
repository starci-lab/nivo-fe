/** Workspace controller contracts. Chatbot browser traffic is always mediated by Core. */

export type WorkspaceControlplaneResult<T> = {
  readonly ok: true;
  readonly data: T;
} | {
  readonly ok: false;
  readonly code: string;
};

/** One installation-qualified channel projection; credential material never crosses this boundary. */
export type ChatbotChannelBinding = {
  readonly id: string;
  readonly installationId: string;
  readonly provider: "telegram" | "zalo" | string;
  readonly accountRef: string;
  readonly state: string;
  readonly credentialRef: string | null;
};

/** One conversation owned by exactly one Chatbot installation. */
export type ChatbotConversation = {
  readonly id: string;
  readonly installationId: string;
  readonly participantRef: string;
  readonly handoffState: string;
  readonly authorityEpoch: number;
  readonly approvedVersion: number | null;
  readonly lastMessageAt: string;
};

/** Truthful recorded delivery state; ambiguous is never treated as sent. */
export type ChatbotMessage = {
  readonly id: string;
  readonly conversationId: string;
  readonly direction: string;
  readonly sequence: string;
  readonly body: string;
  readonly deliveryState: string;
  readonly providerOutboxId: string | null;
  readonly failureCode: string | null;
  readonly occurredAt: string;
};

/** Complete read model for one installed Chatbot workbench. */
export type ChatbotWorkbench = {
  readonly installationId: string;
  readonly lifecycleState: string;
  readonly approvedVersion: number | null;
  readonly channels: ReadonlyArray<ChatbotChannelBinding>;
  readonly conversations: ReadonlyArray<ChatbotConversation>;
  readonly messages: ReadonlyArray<ChatbotMessage>;
};

/** Stable command result returned after installation-scoped readback. */
export type ChatbotCommandResult = {
  readonly id: string;
  readonly installationId: string;
  readonly state: string;
  readonly authorizationUrl?: string | null;
};
type GraphqlEnvelope<T> = {
  readonly data?: T;
  readonly errors?: ReadonlyArray<{
    readonly message?: string;
  }>;
};
const WORKSPACE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
type ChatbotCoreOperation = "workbench" | "bind-channel" | "start-zalo-oauth" | "set-handoff" | "resolve-handoff" | "reconcile-delivery";
const chatbotCoreEndpoint = (workspaceId: string): string | null => {
  if (!WORKSPACE_ID.test(workspaceId)) return null;
  try {
    return new URL(process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3068/graphql").toString();
  } catch {
    return null;
  }
};
const chatbotCoreRequest = async <T,>(workspaceId: string, accessToken: string, installationId: string, operation: ChatbotCoreOperation, input?: Readonly<Record<string, unknown>>): Promise<WorkspaceControlplaneResult<T>> => {
  const endpoint = chatbotCoreEndpoint(workspaceId);
  if (endpoint === null || accessToken.length === 0) return { ok: false, code: "WORKSPACE_CONTROLLER_UNAVAILABLE" };
  try {
    const read = operation === "workbench";
    const field = read ? "chatbotWorkspaceWorkbench" : "chatbotWorkspaceCommand";
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        query: `${read ? "query" : "mutation"} ChatbotWorkspaceGateway($request: ${read ? "ChatbotWorkspaceReadRequest" : "ChatbotWorkspaceCommandRequest"}!) { ${field}(request: $request) }`,
        variables: {
          request: { workspaceId, installationId, ...(read ? {} : { operation, input: input ?? {} }) }
        }
      })
    });
    const outer = (await response.json()) as {
      readonly data?: Readonly<Record<string, GraphqlEnvelope<T>>>;
      readonly errors?: ReadonlyArray<{ readonly message?: string }>;
    };
    const envelope = outer.data?.[field];
    if (!response.ok || envelope?.data === undefined || (outer.errors?.length ?? 0) > 0 || (envelope.errors?.length ?? 0) > 0) return {
      ok: false,
      code: response.status === 401 || response.status === 403 ? "WORKSPACE_CONTROLLER_REFUSED" : "WORKSPACE_CONTROLLER_FAILED"
    };
    return { ok: true, data: envelope.data };
  } catch {
    return { ok: false, code: "WORKSPACE_CONTROLLER_UNREACHABLE" };
  }
};

/** Read the accepted installation-qualified Chatbot workbench contract. */
export const chatbotWorkbench = async (_hostname: string, workspaceId: string, accessToken: string, installationId: string): Promise<WorkspaceControlplaneResult<ChatbotWorkbench>> => {
  const result = await chatbotCoreRequest<{ readonly chatbotWorkbench: ChatbotWorkbench }>(workspaceId, accessToken, installationId, "workbench");
  return result.ok ? { ok: true, data: result.data.chatbotWorkbench } : result;
};

const mutateChatbot = async (workspaceId: string, accessToken: string, installationId: string, operation: ChatbotCoreOperation, input: Readonly<Record<string, unknown>>, field: string): Promise<WorkspaceControlplaneResult<ChatbotCommandResult>> => {
  const result = await chatbotCoreRequest<Readonly<Record<string, ChatbotCommandResult>>>(workspaceId, accessToken, installationId, operation, input);
  if (!result.ok) return result;
  const action = result.data[field];
  return action === undefined ? { ok: false, code: "WORKSPACE_CONTROLLER_FAILED" } : { ok: true, data: action };
};

/** Bind an opaque, already-sealed channel reference to one installation. */
export const bindChatbotChannel = (_hostname: string, workspaceId: string, accessToken: string, input: Readonly<Record<string, unknown>>) => mutateChatbot(workspaceId, accessToken, String(input.installationId ?? ""), "bind-channel", input, "bindChatbotChannel");

/** Start a one-time Zalo OAuth intent; the browser receives no provider token. */
export const startChatbotZaloOauth = (_hostname: string, workspaceId: string, accessToken: string, input: Readonly<Record<string, unknown>>) => mutateChatbot(workspaceId, accessToken, String(input.installationId ?? ""), "start-zalo-oauth", input, "startZaloChatbotAuthorization");

/** Fence one conversation into human mode before any later provider start. */
export const setChatbotHandoff = (_hostname: string, workspaceId: string, accessToken: string, input: Readonly<Record<string, unknown>>) => mutateChatbot(workspaceId, accessToken, String(input.installationId ?? ""), "set-handoff", input, "setChatbotHandoff");

/** Resolve human mode only through the installation-qualified authority command. */
export const resolveChatbotHandoff = (_hostname: string, workspaceId: string, accessToken: string, input: Readonly<Record<string, unknown>>) => mutateChatbot(workspaceId, accessToken, String(input.installationId ?? ""), "resolve-handoff", input, "resolveChatbotHandoff");

/** Reconcile ambiguous delivery evidence without issuing a blind resend. */
export const reconcileChatbotDelivery = (_hostname: string, workspaceId: string, accessToken: string, input: Readonly<Record<string, unknown>>) => mutateChatbot(workspaceId, accessToken, String(input.installationId ?? ""), "reconcile-delivery", {
    ...input,
    outboxId: input.providerOutboxId,
    terminalState: input.outcome === "delivered" ? "sent" : "failed",
    evidenceRef: `operator://manual-reconciliation/${String(input.providerOutboxId)}`,
    providerOutboxId: undefined,
    outcome: undefined
  }, "reconcileChatbotDelivery");

/** Narrow transport hooks exposed only for focused endpoint-policy tests. */
export const workspaceControlplaneTesting = {
  chatbotCoreEndpoint
};
