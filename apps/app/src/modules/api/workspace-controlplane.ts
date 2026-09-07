/** Workspace controller contracts. Chatbot browser traffic is always mediated by Core. */

export type WorkspaceControlplaneResult<T> = {
  readonly ok: true;
  readonly data: T;
} | {
  readonly ok: false;
  readonly code: string;
};

/** One Telegram customer identity stored inside exactly one workspace. */
export type SupportCustomerConversation = {
  readonly id: string;
  readonly installationId: string;
  readonly displayHandle: string;
  readonly customerName: string | null;
  readonly takeoverState: string;
  readonly unreadCount: number;
  readonly lastMessageAt: string;
};

/** One immutable inbound or outbound customer transcript entry. */
export type SupportCustomerMessage = {
  readonly id: string;
  readonly conversationId: string;
  readonly direction: string;
  readonly senderType: string;
  readonly body: string;
  readonly sequence: number;
  readonly contextDigest: string | null;
  readonly policyClass: string | null;
  readonly decisionId: string | null;
  readonly deliveryOutboxId: string | null;
  readonly deliveryState: string;
  readonly failureCode: string | null;
  readonly occurredAt: string;
};

/** One evidence-backed fact or incident queued for operator attention. */
export type SupportTicket = {
  readonly id: string;
  readonly conversationId: string;
  readonly title: string;
  readonly summary: string;
  readonly priority: string;
  readonly state: string;
  readonly evidenceCount: number;
  readonly updatedAt: string;
};

/** One source-cited important fact extracted from a customer message. */
export type SupportImportantFact = {
  readonly id: string;
  readonly conversationId: string;
  readonly ticketId: string | null;
  readonly sourceMessageId: string;
  readonly factType: string;
  readonly value: string;
  readonly confidence: string;
  readonly createdAt: string;
};

/** Attributable result returned by a workspace operator mutation. */
export type SupportOperatorAction = {
  readonly id: string;
  readonly state: string;
};
/** Bounded cursor page returned by the workspace controller. */
export type SupportConnection<T> = {
  readonly nodes: ReadonlyArray<T>;
  readonly nextCursor: string | null;
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
const configuredEndpoint = process.env.NEXT_PUBLIC_AGENTOS_CONTROLPLANE_GRAPHQL_URL;
const WORKSPACE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const externallyReachableHostname = (hostname: string, workspaceId: string): string | null => {
  if (!hostname.endsWith(".agentos.local")) return hostname;
  return WORKSPACE_ID.test(workspaceId) ? `agent-${workspaceId}.nivo.vn` : null;
};
const endpointCandidate = (configured: string | undefined, hostname: string): string => {
  if (configured !== undefined) return configured;
  if (/^https?:\/\//u.test(hostname)) return `${hostname.replace(/\/$/u, "")}/graphql`;
  const localHostname = hostname === "localhost" || hostname.startsWith("localhost:") || hostname.startsWith("127.");
  const protocol = localHostname ? "http" : "https";
  return `${protocol}://${hostname}/graphql`;
};
const endpointFor = (hostname: string, workspaceId: string): string | null => {
  const configured = configuredEndpoint?.replaceAll("{hostname}", hostname).replaceAll("{workspaceId}", workspaceId);
  const reachableHostname = externallyReachableHostname(hostname, workspaceId);
  if (configured === undefined && reachableHostname === null) return null;
  const selectedHostname = reachableHostname ?? hostname;
  const candidate = endpointCandidate(configured, selectedHostname);
  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && (url.hostname === "localhost" || url.hostname.startsWith("127.")))) return null;
    return url.toString();
  } catch {
    return null;
  }
};
const request = async <T,>(hostname: string, workspaceId: string, accessToken: string, query: string, variables: Readonly<Record<string, unknown>>): Promise<WorkspaceControlplaneResult<T>> => {
  const endpoint = endpointFor(hostname, workspaceId);
  if (endpoint === null || accessToken.length === 0) return {
    ok: false,
    code: "WORKSPACE_CONTROLLER_UNAVAILABLE"
  };
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    const envelope = (await response.json()) as GraphqlEnvelope<T>;
    if (!response.ok || envelope.data === undefined || (envelope.errors?.length ?? 0) > 0) {
      return {
        ok: false,
        code: response.status === 401 || response.status === 403 ? "WORKSPACE_CONTROLLER_REFUSED" : "WORKSPACE_CONTROLLER_FAILED"
      };
    }
    return {
      ok: true,
      data: envelope.data
    };
  } catch {
    return {
      ok: false,
      code: "WORKSPACE_CONTROLLER_UNREACHABLE"
    };
  }
};

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

/** Read customer identities from one workspace without proxying transcripts through Core. */
export const supportCustomerConversations = async (hostname: string, workspaceId: string, accessToken: string, installationId: string): Promise<WorkspaceControlplaneResult<SupportConnection<SupportCustomerConversation>>> => {
  const result = await request<{
    readonly supportCustomerConversations: SupportConnection<SupportCustomerConversation>;
  }>(hostname, workspaceId, accessToken, `query SupportCustomerConversations($installationId: ID!) {
            supportCustomerConversations(installationId: $installationId) {
                nodes { id installationId displayHandle customerName takeoverState unreadCount lastMessageAt }
                nextCursor
            }
        }`, {
    installationId
  });
  return result.ok ? {
    ok: true,
    data: result.data.supportCustomerConversations
  } : result;
};

/** Read the durable transcript for one authorized workspace conversation. */
export const supportCustomerMessages = async (hostname: string, workspaceId: string, accessToken: string, conversationId: string): Promise<WorkspaceControlplaneResult<SupportConnection<SupportCustomerMessage>>> => {
  const result = await request<{
    readonly supportCustomerMessages: SupportConnection<SupportCustomerMessage>;
  }>(hostname, workspaceId, accessToken, `query SupportCustomerMessages($conversationId: ID!) {
            supportCustomerMessages(conversationId: $conversationId) {
                nodes {
                    id conversationId direction senderType body sequence contextDigest policyClass
                    decisionId deliveryOutboxId deliveryState failureCode occurredAt
                }
                nextCursor
            }
        }`, {
    conversationId
  });
  return result.ok ? {
    ok: true,
    data: result.data.supportCustomerMessages
  } : result;
};

/** Read evidence-backed Support workbench items for one module installation. */
export const supportTickets = async (hostname: string, workspaceId: string, accessToken: string, installationId: string): Promise<WorkspaceControlplaneResult<SupportConnection<SupportTicket>>> => {
  const result = await request<{
    readonly supportTickets: SupportConnection<SupportTicket>;
  }>(hostname, workspaceId, accessToken, `query SupportTickets($installationId: ID!) {
            supportTickets(installationId: $installationId) {
                nodes { id conversationId title summary priority state evidenceCount updatedAt }
                nextCursor
            }
        }`, {
    installationId
  });
  return result.ok ? {
    ok: true,
    data: result.data.supportTickets
  } : result;
};

/** Read source-cited important facts for one Support module installation. */
export const supportImportantFacts = async (hostname: string, workspaceId: string, accessToken: string, installationId: string): Promise<WorkspaceControlplaneResult<SupportConnection<SupportImportantFact>>> => {
  const result = await request<{
    readonly supportImportantFacts: SupportConnection<SupportImportantFact>;
  }>(hostname, workspaceId, accessToken, `query SupportImportantFacts($installationId: ID!) {
            supportImportantFacts(installationId: $installationId) {
                nodes { id conversationId ticketId sourceMessageId factType value confidence createdAt }
                nextCursor
            }
        }`, {
    installationId
  });
  return result.ok ? {
    ok: true,
    data: result.data.supportImportantFacts
  } : result;
};
const mutate = async (hostname: string, workspaceId: string, accessToken: string, query: string, variables: Readonly<Record<string, unknown>>, field: string): Promise<WorkspaceControlplaneResult<SupportOperatorAction>> => {
  const result = await request<Readonly<Record<string, SupportOperatorAction>>>(hostname, workspaceId, accessToken, query, variables);
  if (!result.ok) return result;
  const action = result.data[field];
  return action === undefined ? {
    ok: false,
    code: "WORKSPACE_CONTROLLER_FAILED"
  } : {
    ok: true,
    data: action
  };
};

/** Approve and queue one previously gated customer reply. */
export const approveSupportReply = (hostname: string, workspaceId: string, accessToken: string, decisionId: string) => mutate(hostname, workspaceId, accessToken, `mutation ApproveSupportReply($decisionId: ID!) { approveSupportReply(decisionId: $decisionId) { id state } }`, {
  decisionId
}, "approveSupportReply");

/** Enable or release explicit human takeover for one customer conversation. */
export const setSupportTakeover = (hostname: string, workspaceId: string, accessToken: string, conversationId: string, takeover: boolean) => mutate(hostname, workspaceId, accessToken, `mutation SetSupportTakeover($conversationId: ID!, $takeover: Boolean!) { setSupportTakeover(conversationId: $conversationId, takeover: $takeover) { id state } }`, {
  conversationId,
  takeover
}, "setSupportTakeover");

/** Reconcile one ambiguous provider timeout without unsafe blind retry. */
export const reconcileSupportDelivery = (hostname: string, workspaceId: string, accessToken: string, outboxId: string, delivered: boolean) => mutate(hostname, workspaceId, accessToken, `mutation ReconcileSupportDelivery($outboxId: ID!, $delivered: Boolean!) { reconcileSupportDelivery(outboxId: $outboxId, delivered: $delivered) { id state } }`, {
  outboxId,
  delivered
}, "reconcileSupportDelivery");

/** Narrow transport hooks exposed only for focused endpoint-policy tests. */
export const workspaceControlplaneTesting = {
  endpointFor,
  chatbotCoreEndpoint
};
