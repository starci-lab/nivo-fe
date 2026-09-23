/**
 * Collab Office data layer - one tagged member request to one named Collab operation
 * (`contract.collab.chat`, `contract.collab.task-read`, `contract.collab.member-invite`,
 * `contract.collab.module-work`, `contract.collab.turn-notice`; mirrored from
 * `impl.collab.nivo-backend.gateway`).
 *
 * WHAT IS SETTLED. The backend ships one transport-agnostic entry,
 * `CollabGatewayService.handle(actor, {op, input})`, which authenticates the member,
 * re-checks current membership on every call, dispatches exactly one named operation and
 * returns a typed `CollabGatewayOutcome` - never throws. This module mirrors that closed
 * operation set and its projections one-for-one; it owns no second task authority, keeps
 * no optimistic copies, and never attests a role, grant or phone it was not given.
 *
 * WHAT IS DELIBERATELY NOT SETTLED. The accepted design records transport as "Not chosen"
 * (`contract.collab.chat` live-delivery, `architecture.collab.overview`), and the backend
 * publishes no Collab ingress yet: the gateway is an internal service, not a resolver.
 * So the WIRE BINDING below is the one movable part of this file. It follows the door the
 * codebase already opened for the same gateway shape - `chatbotWorkspaceGateway`
 * (`chatbotWorkspaceWorkbench`/`chatbotWorkspaceCommand`): one tagged-request field per
 * direction, a GraphQLJSON result carrying the service's own typed outcome, and a request
 * argument of `{workspaceId, op, input}`. The resolver supplies the verified member
 * identity; the request carries only the workspace scope, the operation name and the
 * domain input. When the real Collab resolver ships under its chosen names, only the two
 * field constants and the document below move - the exported operation vocabulary and the
 * result contract stay.
 *
 * WHY NOT `graphql()`. The shared transport unwraps the `GraphQLTransformInterceptor`
 * envelope `{success, message, error, data}`; a gateway outcome is itself the typed
 * answer (`{ok:true, op, result}` / `{ok:false, failure}`) and would be mangled by that
 * unwrap. So this module posts its own document and reads the field payload bare, the
 * same way `chatbotCoreRequest` does for the chatbot gateway.
 *
 * WHY FAILURE KIND AND RETRYABILITY SURVIVE. The contract separates a non-disclosing
 * denial (a foreign or former member learns nothing, retrying is pointless) from an
 * unavailable or unknown outcome (safe to reconcile and retry). Collapsing them into one
 * `ok:false` is exactly how a client invents work or leaks a workspace boundary, so
 * `CollabResult` keeps `kind` and `retryable` where plain `Result<T>` only keeps `code`.
 */

import type { Result } from "./graphql"

/** Where the core API answers; same endpoint the shared transport uses. */
const COLLAB_ENDPOINT = process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3068/graphql";

/** The read direction field; moves when the real Collab resolver names itself. */
export const COLLAB_GATEWAY_READ_FIELD = "collabGatewayRead";

/** The command direction field; moves when the real Collab resolver names itself. */
export const COLLAB_GATEWAY_COMMAND_FIELD = "collabGatewayCommand";

/**
 * The closed named-operation set one member request resolves to. The first ten are
 * `CollabGatewayOperation` verbatim; the four membership operations belong to the
 * member-invite contract and the ingress dispatches them to the membership boundary -
 * the FE names the operation and never decides which service answers it.
 */
export type CollabOperation =
    | "openOffice"
    | "readGroup"
    | "postMessage"
    | "pressApprovalButton"
    | "listTasks"
    | "readTask"
    | "availableCommands"
    | "readNotices"
    | "openNotice"
    | "reconcileRequest"
    | "inviteByPhone"
    | "acceptInvitation"
    | "withdrawInvitation"
    | "changeMemberRole";

/** Operations that read and never write; they travel on the query field. */
const COLLAB_READ_OPERATIONS: ReadonlySet<CollabOperation> = new Set([
    "openOffice",
    "readGroup",
    "listTasks",
    "readTask",
    "availableCommands",
    "readNotices",
    "openNotice",
    "reconcileRequest",
]);

/** The failure vocabulary the gateway maps; member-visible denial never discloses scope. */
export type CollabFailureKind =
    | "unauthenticated"
    | "denied"
    | "invalid"
    | "conflict"
    | "unavailable"
    | "unknown";

/** One typed refusal inside the boundary; `retryable` separates transient from final. */
export type CollabFailure = {
    /** The operation that failed, when one resolved before the failure. */
    readonly op: CollabOperation | null;
    readonly kind: CollabFailureKind;
    readonly reason: string;
    readonly retryable: boolean;
};

/** The tagged member request the ingress resolves against one verified member identity. */
export type CollabGatewayRequest = {
    readonly workspaceId: string;
    readonly op: CollabOperation;
    readonly input: Readonly<Record<string, unknown>>;
};

/**
 * The tagged outcome the gateway returns. `op` echoes the operation answered so a
 * caller can never mistake which request a page belongs to.
 */
export type CollabGatewayOutcome = {
    readonly ok: true;
    readonly op: CollabOperation;
    readonly result: Record<string, unknown>;
} | {
    readonly ok: false;
    readonly failure: CollabFailure;
};

/**
 * What a caller gets back. Unlike plain `Result<T>`, the refusal keeps the boundary's
 * own `kind` and `retryable`, because "denied" and "unavailable" demand opposite client
 * behaviour (never retry versus reconcile and retry).
 */
export type CollabResult<T> = {
    readonly ok: true;
    readonly data: T;
} | {
    readonly ok: false;
    readonly code: string;
    readonly reason: string;
    readonly kind: CollabFailureKind | null;
    readonly retryable: boolean;
};

/* ------------------------------------------------------------------ */
/* Wire projections - mirror impl.collab.nivo-backend.*, read-only FE.  */
/* ------------------------------------------------------------------ */

/** Public projection of the workspace's one Office group. */
export type CollabGroupView = {
    readonly groupId: string;
    readonly workspaceId: string;
    readonly name: string;
    readonly isDefaultOffice: boolean;
};

/** One participant row of the current Office roster; never carries a phone number. */
export type CollabOfficeParticipant = {
    readonly memberId: string;
    readonly kind: "human" | "module";
    readonly displayName: string;
    readonly role: string;
    readonly status: string;
};

/** The Office landing bundle: the one group plus its current roster. */
export type CollabOfficeView = {
    readonly group: CollabGroupView;
    readonly participants: ReadonlyArray<CollabOfficeParticipant>;
};

/** Public projection of one durable group message. */
export type CollabMessageView = {
    readonly messageId: string;
    readonly workspaceId: string;
    readonly groupId: string;
    readonly authorKind: "human" | "module";
    readonly authorMemberId: string | null;
    readonly authorModuleInstallationId: string | null;
    readonly body: string;
    readonly intentId: string;
    readonly addressedModuleInstallationId: string | null;
    readonly addressedModuleKey: string | null;
    readonly answersQuestionId: string | null;
    readonly occurredAt: string;
};

/** The receiver-owned receipt projected onto a card; never a Collab-invented status. */
export type CollabReceiptView =
    | { readonly disposition: "reported"; readonly receiptId: string }
    | { readonly disposition: "not-yet-reported" }
    | { readonly disposition: "refused"; readonly reason: string | null };

/** Public projection of one durable command binding. */
export type CollabBindingView = {
    readonly bindingId: string;
    readonly workspaceId: string;
    readonly groupId: string;
    readonly sourceMessageId: string;
    readonly intentId: string;
    readonly receiverModuleInstallationId: string;
    readonly receiverModuleKey: string;
    readonly commandName: string;
    readonly commandVersion: string;
    readonly askerMemberId: string;
    readonly routingRuleId: string | null;
    readonly status: "recorded" | "pending" | "admitted" | "refused";
    readonly receipt: CollabReceiptView;
};

/** One page of the authorized Office conversation. */
export type CollabGroupRead = {
    readonly group: CollabGroupView;
    readonly messages: ReadonlyArray<CollabMessageView>;
    readonly cards: ReadonlyArray<CollabBindingView>;
    readonly nextCursor?: string;
};

/** One command the addressed module published for this workspace. */
export type CollabPublishedCommand = {
    readonly name: string;
    readonly version: string;
};

/** Public projection of one hired module participant row. */
export type CollabModuleParticipant = {
    readonly memberId: string;
    readonly workspaceId: string;
    readonly displayName: string;
    readonly moduleInstallationId: string;
    readonly moduleKey: string;
    readonly status: string;
};

/** Outcome of `availableCommands`; `unresolved` exposes only addressable hired names. */
export type CollabAvailableCommandsOutcome =
    | {
        readonly status: "resolved";
        readonly member: CollabModuleParticipant;
        readonly commands: ReadonlyArray<CollabPublishedCommand>;
    }
    | {
        readonly status: "unresolved";
        readonly availableModules: ReadonlyArray<string>;
    };

/** Why the router answered with a clarification instead of work. */
export type CollabClarificationReason =
    | "unmatched"
    | "ambiguous"
    | "unsupported-version"
    | "no-commands";

/**
 * Outcome of `routeMessage`. Only `admitted`/`existing` carry an admitted binding;
 * `held`/`pending` keep the durable binding reconcilable under the same intent.
 */
export type CollabRouteOutcome =
    | {
        readonly kind: "admitted" | "existing" | "held" | "pending" | "refused";
        readonly message: CollabMessageView;
        readonly binding: CollabBindingView;
    }
    | {
        readonly kind: "clarified";
        readonly reason: CollabClarificationReason;
        readonly message: CollabMessageView;
        readonly clarification: CollabMessageView;
        readonly commands: ReadonlyArray<CollabPublishedCommand>;
    }
    | {
        readonly kind: "unresolved" | "not-addressed";
        readonly message: CollabMessageView;
        readonly availableModules?: ReadonlyArray<string>;
    };

/** The one state machine a task moves through. */
export type CollabTaskStatus =
    | "created"
    | "working"
    | "waiting-on-answer"
    | "waiting-on-approval"
    | "done"
    | "rejected"
    | "cancelled";

/** The button decisions a waiting approval card accepts. */
export type CollabApprovalDecision = "approve" | "reject";

/** Public projection of the one attributable question a waiting task holds. */
export type CollabTaskQuestionView = {
    readonly questionId: string;
    readonly workspaceId: string;
    readonly taskId: string;
    readonly moduleInstallationId: string;
    readonly body: string;
    readonly status: "open" | "answered" | "superseded";
    readonly answerMessageId: string | null;
    readonly askedAt: string;
    readonly answeredAt: string | null;
};

/** Public projection of one task-linked approval card and its decision. */
export type CollabApprovalView = {
    readonly approvalId: string;
    readonly workspaceId: string;
    readonly groupId: string;
    readonly taskId: string;
    readonly action: string;
    readonly consequence: string | null;
    readonly heldActionKey: string;
    readonly requiredRole: "manager-or-owner";
    readonly status: "waiting" | "approved" | "rejected" | "withdrawn";
    readonly decidedByMemberId: string | null;
    readonly decision: CollabApprovalDecision | null;
    readonly decidedAt: string | null;
    readonly releaseIntentId: string | null;
    readonly cardMessageId: string | null;
};

/** The card as Office shows it: the approval projection plus its exact two buttons. */
export type CollabApprovalCardView = CollabApprovalView & {
    readonly buttons: ReadonlyArray<CollabApprovalDecision>;
    readonly decidedByDisplayName: string | null;
    readonly decidedByRole: string | null;
};

/** The recorded press returned as the held action's answer. */
export type CollabApprovalAnswer = {
    readonly taskId: string;
    readonly groupId: string;
    readonly approvalId: string;
    readonly heldActionKey: string;
    readonly decision: CollabApprovalDecision;
    readonly releaseIntentId: string | null;
    readonly decidedByMemberId: string;
    readonly decidedByDisplayName: string | null;
    readonly decidedByRole: string | null;
    readonly decidedAt: string;
};

/** What the task currently waits on: an attributable answer or an exact card. */
export type CollabTaskWaiting =
    | { readonly kind: "answer"; readonly question: CollabTaskQuestionView }
    | { readonly kind: "approval"; readonly approval: CollabApprovalView };

/** The one authoritative task projection both Office card and Tasks row read. */
export type CollabTaskView = {
    readonly taskId: string;
    readonly workspaceId: string;
    readonly groupId: string;
    readonly bindingId: string | null;
    readonly cardMessageId: string | null;
    readonly intentId: string;
    readonly statement: string;
    readonly owningModuleInstallationId: string;
    readonly owningModuleKey: string;
    readonly owningModuleDisplayName: string | null;
    readonly askedByMemberId: string;
    readonly askedByDisplayName: string | null;
    readonly assignedToMemberId: string | null;
    readonly assignedToDisplayName: string | null;
    readonly routingRuleId: string | null;
    readonly status: CollabTaskStatus;
    readonly version: number;
    readonly waiting: CollabTaskWaiting | null;
    readonly outcome: Record<string, unknown> | null;
    readonly createdAt: string;
    readonly updatedAt: string;
};

/** One page of the authorized Tasks read; filters are presentation, never authority. */
export type CollabTaskList = {
    readonly tasks: ReadonlyArray<CollabTaskView>;
    readonly nextCursor?: string;
};

/** The exact group card target a Tasks row opens. */
export type CollabTaskCardTarget = {
    readonly groupId: string;
    readonly cardMessageId: string | null;
    readonly bindingId: string | null;
};

/** Outcome of `readTask`; `unavailable` is scope-neutral and discloses nothing. */
export type CollabReadTaskOutcome = {
    readonly outcome: "found" | "unavailable";
    readonly task?: CollabTaskView;
    readonly card?: CollabTaskCardTarget;
};

/** Outcome of `pressApprovalButton`; a competing press is a conflict, not an overwrite. */
export type CollabPressApprovalButtonOutcome = {
    readonly outcome: "decided" | "existing" | "unavailable";
    readonly card?: CollabApprovalCardView;
    readonly task?: CollabTaskView;
    readonly answer?: CollabApprovalAnswer;
};

/** The two turn reasons a notice may carry. */
export type CollabTurnKind = "task-assign" | "approval";

/** The durable notice lifecycle. */
export type CollabNoticeStatus = "raised" | "delivered" | "resolved" | "retired";

/** The exact Office target a notice opens. */
export type CollabNoticeTarget = {
    readonly groupId: string;
    readonly taskId: string | null;
    readonly approvalId: string | null;
    readonly cardMessageId: string | null;
};

/** Public projection of one durable notice row; deduped client-side by `noticeId`. */
export type CollabTurnNoticeView = {
    readonly noticeId: string;
    readonly workspaceId: string;
    readonly groupId: string;
    readonly recipientMemberId: string;
    readonly turnKind: CollabTurnKind;
    readonly taskId: string | null;
    readonly approvalId: string | null;
    readonly turnIdentity: string;
    readonly status: CollabNoticeStatus;
    readonly intentKey: string;
    readonly raisedAt: string;
    readonly deliveredAt: string | null;
    readonly resolvedAt: string | null;
    readonly retiredAt: string | null;
};

/** The current authoritative state of the turn a notice names, re-read at follow time. */
export type CollabTurnState = {
    readonly state: "open" | "handled" | "ended";
    readonly handledByMemberId: string | null;
    readonly decision: "answered" | "approve" | "reject" | null;
    readonly handledAt: string | null;
};

/** One outstanding notice paired with the live authoritative state of its turn. */
export type CollabTurnNoticeItem = {
    readonly notice: CollabTurnNoticeView;
    readonly turn: CollabTurnState;
    readonly target: CollabNoticeTarget;
};

/** One page of the authorized notice read. */
export type CollabTurnNoticePage = {
    readonly notices: ReadonlyArray<CollabTurnNoticeItem>;
    readonly nextCursor?: string;
};

/** Outcome of `openNotice`; a stale notice grants no action. */
export type CollabOpenTurnNoticeOutcome = {
    readonly outcome: "open" | "handled" | "ended" | "unavailable";
    readonly notice?: CollabTurnNoticeView;
    readonly turn?: CollabTurnState;
    readonly target?: CollabNoticeTarget;
};

/** Public projection of one member row; never carries a phone number. */
export type CollabMemberView = {
    readonly memberId: string;
    readonly workspaceId: string;
    readonly kind: "human" | "module";
    readonly displayName: string;
    readonly role: string;
    readonly status: string;
};

/** Outcome of `inviteByPhone`; `existing` covers duplicate and raced submissions. */
export type CollabInviteOutcome = {
    readonly outcome: "invited" | "existing";
    readonly member: CollabMemberView;
};

/** Outcome of `acceptInvitation`; `existing` replays the first committed acceptance. */
export type CollabAcceptOutcome = {
    readonly outcome: "accepted" | "existing";
    readonly member: CollabMemberView;
};

/** Outcome of `withdrawInvitation`; acceptance and withdrawal have one winner. */
export type CollabWithdrawOutcome = {
    readonly outcome: "withdrawn" | "accepted" | "unavailable";
    readonly member?: CollabMemberView;
};

/** Outcome of `changeMemberRole`; `unchanged` is the idempotent same-role replay. */
export type CollabChangeMemberRoleOutcome = {
    readonly outcome: "changed" | "unchanged" | "unavailable";
    readonly member?: CollabMemberView;
};

/**
 * Result of `reconcileRequest`: `matched` returns the durable binding with its
 * receiver-owned receipt, `none` proves no work exists under this intent. Read before
 * any resend; an intent that matched is never resent.
 */
export type CollabReconcileOutcome = {
    readonly outcome: "matched" | "none";
    readonly binding?: CollabBindingView;
};

/** How the member's answer post bound to the exact open question (`fr.collab.ask-back`). */
export type CollabAnswerBinding = {
    /**
     * `answered`/`existing` bound the message to the question; `stale`/`not-applied`
     * left it an ordinary message; `unknown` could not be proven - retryable, never
     * implying the task continued.
     */
    readonly outcome: "answered" | "existing" | "stale" | "not-applied" | "unknown";
    readonly reason?: string;
    readonly retryable?: boolean;
    readonly task?: CollabTaskView;
    readonly question?: CollabTaskQuestionView;
};

/* ------------------------------------------------------------------ */
/* Transport seam - the one movable binding.                          */
/* ------------------------------------------------------------------ */

/** One tagged call on the transport: the session credential plus the member request. */
export type CollabTransportCall = {
    readonly accessToken: string;
    readonly request: CollabGatewayRequest;
};

/** How one tagged member request travels; the app binds exactly one implementation. */
export type CollabTransport = (call: CollabTransportCall) => Promise<CollabGatewayOutcome>;

/** How a caller supplies the reader's language without this module knowing routing. */
export type CollabLocaleReader = () => string;

/**
 * The language every Collab refusal should come back in; mirrors `useLocaleFrom` in
 * `graphql.ts`. The backend interceptor currently answers English regardless - the
 * header rides anyway so the day per-request locale lands, Collab is already honest.
 */
let readCollabLocale: CollabLocaleReader = () => "vi";

/** Tell the Collab transport which language the reader is in. */
export const useCollabLocaleFrom = (reader: CollabLocaleReader) => {
    readCollabLocale = reader;
};

const collabFailure = (
    kind: CollabFailureKind | null,
    code: string,
    reason: string,
    retryable: boolean,
): CollabResult<never> => ({ ok: false, code, reason, kind, retryable });

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const COLLAB_FAILURE_KINDS: ReadonlySet<string> = new Set([
    "unauthenticated",
    "denied",
    "invalid",
    "conflict",
    "unavailable",
    "unknown",
]);

/** Reject anything that is not the boundary's own outcome shape before trusting it. */
const readOutcome = (value: unknown): CollabGatewayOutcome | null => {
    if (!isRecord(value) || typeof value.ok !== "boolean") {
        return null;
    }
    if (value.ok === true) {
        return typeof value.op === "string" && isRecord(value.result)
            ? { ok: true, op: value.op as CollabOperation, result: value.result }
            : null;
    }
    const failure = value.failure;
    if (
        isRecord(failure) &&
        typeof failure.kind === "string" &&
        COLLAB_FAILURE_KINDS.has(failure.kind) &&
        typeof failure.reason === "string" &&
        typeof failure.retryable === "boolean"
    ) {
        return {
            ok: false,
            failure: {
                op: typeof failure.op === "string" ? (failure.op as CollabOperation) : null,
                kind: failure.kind as CollabFailureKind,
                reason: failure.reason,
                retryable: failure.retryable,
            },
        };
    }
    return null;
};

/**
 * The default binding: one tagged-request document to the shared core GraphQL endpoint,
 * `collabGatewayRead` for reads and `collabGatewayCommand` for writes - the same door
 * shape `chatbotWorkspaceGateway` opened for its closed-op gateway. The Collab resolver
 * is not published yet; when it ships, this is the only function whose constants move.
 */
export const collabGatewayTransport: CollabTransport = async ({ accessToken, request }) => {
    const field = COLLAB_READ_OPERATIONS.has(request.op)
        ? COLLAB_GATEWAY_READ_FIELD
        : COLLAB_GATEWAY_COMMAND_FIELD;
    const document = COLLAB_READ_OPERATIONS.has(request.op)
        ? `query CollabGateway($request: CollabGatewayRequest!) { ${field}(request: $request) }`
        : `mutation CollabGateway($request: CollabGatewayRequest!) { ${field}(request: $request) }`;
    let response: Response;
    try {
        response = await fetch(COLLAB_ENDPOINT, {
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json",
                "accept-language": readCollabLocale(),
                ...(accessToken === "" ? {} : { authorization: `Bearer ${accessToken}` }),
            },
            body: JSON.stringify({ query: document, variables: { request } }),
        });
    } catch {
        return { ok: false, failure: { op: request.op, kind: "unavailable", reason: "network", retryable: true } };
    }
    if (!response.ok) {
        return {
            ok: false,
            failure: {
                op: request.op,
                kind: response.status === 401 || response.status === 403 ? "denied" : "unavailable",
                reason: `http:${response.status}`,
                retryable: response.status !== 401 && response.status !== 403,
            },
        };
    }
    let body: { data?: Record<string, unknown>; errors?: ReadonlyArray<{ message: string }> };
    try {
        body = await response.json();
    } catch {
        return { ok: false, failure: { op: request.op, kind: "unknown", reason: "malformed", retryable: true } };
    }
    if (body.errors !== undefined && body.errors.length > 0) {
        return {
            ok: false,
            failure: { op: request.op, kind: "unavailable", reason: `graphql:${body.errors[0].message}`, retryable: true },
        };
    }
    const payload = body.data === undefined ? undefined : body.data[field];
    const outcome = readOutcome(payload);
    if (outcome === null) {
        return { ok: false, failure: { op: request.op, kind: "unknown", reason: "malformed", retryable: true } };
    }
    return outcome;
};

/**
 * The transport in force. Defaults to the GraphQL tagged-request binding; the session
 * root or a future live channel swaps it through `useCollabTransportFrom` without the
 * operation vocabulary or the hooks changing.
 */
let transport: CollabTransport = collabGatewayTransport;

/** Bind the transport every Collab call travels on. */
export const useCollabTransportFrom = (next: CollabTransport) => {
    transport = next;
};

/** Send one tagged member request and preserve the boundary's own failure vocabulary. */
const collabRequest = async <T>(
    accessToken: string,
    workspaceId: string,
    op: CollabOperation,
    input: Readonly<Record<string, unknown>>,
    pick: (result: Record<string, unknown>) => T,
): Promise<CollabResult<T>> => {
    if (accessToken === "") {
        return collabFailure("unauthenticated", "COLLAB_UNAUTHENTICATED", "sign-in required", false);
    }
    if (workspaceId === "") {
        return collabFailure("invalid", "COLLAB_INVALID", "workspaceId required", false);
    }
    let outcome: CollabGatewayOutcome;
    try {
        outcome = await transport({ accessToken, request: { workspaceId, op, input } });
    } catch {
        return collabFailure("unknown", "COLLAB_UNKNOWN", "transport threw", true);
    }
    if (!outcome.ok) {
        const code = `COLLAB_${outcome.failure.kind.toUpperCase().replace(/-/g, "_")}`;
        return collabFailure(outcome.failure.kind, code, outcome.failure.reason, outcome.failure.retryable);
    }
    return { ok: true, data: pick(outcome.result) };
};

/* ------------------------------------------------------------------ */
/* Operation helpers - the exported vocabulary, one fn per named op.  */
/* Every call carries the same scope pair plus its own named input.   */
/* ------------------------------------------------------------------ */

/** The scope every member call carries: the workspace entered and the session credential. */
export type CollabCallScope = {
    readonly workspaceId: string;
    readonly accessToken: string;
};

/** `readGroup`/`readNotices` page parameters. */
export type CollabPageCall = CollabCallScope & {
    readonly cursor?: string;
    readonly limit?: number;
};

/** `postMessage`: the caller-owned intent identity is mandatory and reused on resend. */
export type CollabPostMessageCall = CollabCallScope & {
    readonly intentId: string;
    readonly body: string;
    readonly moduleName?: string;
    readonly answersQuestionId?: string;
};

/** `pressApprovalButton`: the exact card and the exact closed button value. */
export type CollabPressApprovalCall = CollabCallScope & {
    readonly approvalId: string;
    readonly button: CollabApprovalDecision;
};

/** `listTasks`: presentation filters only; they narrow the view, never the grant. */
export type CollabListTasksCall = CollabCallScope & {
    readonly personMemberId?: string;
    readonly moduleInstallationId?: string;
    readonly status?: CollabTaskStatus;
    readonly cursor?: string;
    readonly limit?: number;
};

/** `readTask`: one exact task identity. */
export type CollabReadTaskCall = CollabCallScope & { readonly taskId: string };

/** `availableCommands`: the `@` name as typed, with or without the prefix. */
export type CollabCommandsCall = CollabCallScope & { readonly moduleName: string };

/** `openNotice`: one exact notice identity. */
export type CollabOpenNoticeCall = CollabCallScope & { readonly noticeId: string };

/** `reconcileRequest`: one stable intent identity to check before resend. */
export type CollabReconcileCall = CollabCallScope & { readonly intentId: string };

/** The three human roles a V1 invitation or role change may name. */
export type CollabHumanRole = "owner" | "manager" | "staff";

/** `inviteByPhone`: the invited phone and its one role. */
export type CollabInviteCall = CollabCallScope & {
    readonly phone: string;
    readonly role: CollabHumanRole;
};

/** `acceptInvitation`: the invitation identity and optional display name. */
export type CollabAcceptInvitationCall = CollabCallScope & {
    readonly invitationId: string;
    readonly displayName?: string;
};

/** `withdrawInvitation`: the pending invitation identity to close. */
export type CollabWithdrawInvitationCall = CollabCallScope & { readonly invitationId: string };

/** `changeMemberRole`: the member identity and its replacement role. */
export type CollabChangeRoleCall = CollabCallScope & {
    readonly memberId: string;
    readonly role: CollabHumanRole;
};

/** `openOffice`: a current member lands in the one Office group with its roster. */
export const openCollabOffice = (args: CollabCallScope): Promise<CollabResult<CollabOfficeView>> =>
    collabRequest(args.accessToken, args.workspaceId, "openOffice", {}, (r) => r.office as CollabOfficeView);

/** `readGroup`: the authorized conversation page under a resumable cursor. */
export const readCollabGroup = (args: CollabPageCall): Promise<CollabResult<CollabGroupRead>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "readGroup",
        { ...(args.cursor === undefined ? {} : { cursor: args.cursor }), ...(args.limit === undefined ? {} : { limit: args.limit }) },
        (r) => r.page as CollabGroupRead,
    );

/** The `postMessage` answer: the admission disposition plus any bound question-answer. */
export type CollabPostMessageOutcome = {
    readonly route: CollabRouteOutcome;
    readonly answer?: CollabAnswerBinding;
};

/**
 * Claim fields `postMessage` never accepts from a caller: the ingress derives the asker
 * grant from the verified member identity, so a transported role/member/phone/membership
 * claim is refused before the request leaves the adapter.
 */
const POST_MESSAGE_FORBIDDEN_CLAIMS = new Set([
    "askerGrantScope", "role", "member", "memberId", "phone", "membership", "membershipId", "membershipClaims",
]);

/**
 * `postMessage`: commit one message under its stable intent identity. The caller supplies
 * `intentId` - a resend MUST reuse the same identity, and a changed body under a reused
 * identity is a refusal, not an edit. `route` is the admission answer; `answer` carries
 * the bound question-answer when the message closed one.
 */
export const postCollabMessage = (args: CollabPostMessageCall): Promise<CollabResult<CollabPostMessageOutcome>> => {
    const claim = Object.keys(args).find((key) => POST_MESSAGE_FORBIDDEN_CLAIMS.has(key));
    if (claim !== undefined) {
        return Promise.resolve(collabFailure("invalid", "COLLAB_INVALID", `postMessage does not accept ${claim}; membership-service supplies the asker grant.`, false));
    }
    return collabRequest(
        args.accessToken,
        args.workspaceId,
        "postMessage",
        {
            intentId: args.intentId,
            body: args.body,
            ...(args.moduleName === undefined ? {} : { moduleName: args.moduleName }),
            ...(args.answersQuestionId === undefined ? {} : { answersQuestionId: args.answersQuestionId }),
        },
        (r) => ({
            route: r.route as CollabRouteOutcome,
            ...(r.answer === undefined ? {} : { answer: r.answer as CollabAnswerBinding }),
        }),
    );
};

/** `pressApprovalButton`: the exact card, the exact two-button control value. */
export const pressCollabApprovalButton = (args: CollabPressApprovalCall): Promise<CollabResult<CollabPressApprovalButtonOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "pressApprovalButton",
        { approvalId: args.approvalId, button: args.button },
        (r) => r.press as CollabPressApprovalButtonOutcome,
    );

/** `listTasks`: the authorized Tasks page; every filter is presentation only. */
export const listCollabTasks = (args: CollabListTasksCall): Promise<CollabResult<CollabTaskList>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "listTasks",
        {
            ...(args.personMemberId === undefined ? {} : { personMemberId: args.personMemberId }),
            ...(args.moduleInstallationId === undefined ? {} : { moduleInstallationId: args.moduleInstallationId }),
            ...(args.status === undefined ? {} : { status: args.status }),
            ...(args.cursor === undefined ? {} : { cursor: args.cursor }),
            ...(args.limit === undefined ? {} : { limit: args.limit }),
        },
        (r) => r.page as CollabTaskList,
    );

/** `readTask`: the same authoritative task the Office card reads, plus its card target. */
export const readCollabTask = (args: CollabReadTaskCall): Promise<CollabResult<CollabReadTaskOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "readTask",
        { taskId: args.taskId },
        (r) => r.read as CollabReadTaskOutcome,
    );

/** `availableCommands`: resolve one typed `@` name to its published command set. */
export const readCollabAvailableCommands = (args: CollabCommandsCall): Promise<CollabResult<CollabAvailableCommandsOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "availableCommands",
        { moduleName: args.moduleName },
        (r) => r.offer as CollabAvailableCommandsOutcome,
    );

/** `readNotices`: the member's outstanding turn notices under a resumable cursor. */
export const readCollabNotices = (args: CollabPageCall): Promise<CollabResult<CollabTurnNoticePage>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "readNotices",
        { ...(args.cursor === undefined ? {} : { cursor: args.cursor }), ...(args.limit === undefined ? {} : { limit: args.limit }) },
        (r) => r.page as CollabTurnNoticePage,
    );

/** `openNotice`: follow one named notice to its live authoritative target. */
export const openCollabNotice = (args: CollabOpenNoticeCall): Promise<CollabResult<CollabOpenTurnNoticeOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "openNotice",
        { noticeId: args.noticeId },
        (r) => r.notice as CollabOpenTurnNoticeOutcome,
    );

/**
 * `reconcileRequest`: the same-intent read a caller takes before any resend after an
 * uncertain submit. `matched` returns the durable binding and its receiver-owned
 * receipt; an intent that committed is never resent.
 */
export const reconcileCollabRequest = (args: CollabReconcileCall): Promise<CollabResult<CollabReconcileOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "reconcileRequest",
        { intentId: args.intentId },
        (r) => r.reconcile as CollabReconcileOutcome,
    );

/* ------------------------------------------------------------------ */
/* Membership operations - the member-invite contract ops. The ingress */
/* dispatches them to the membership boundary rather than the gateway, */
/* and its result fields ride the tagged result record directly.      */
/* ------------------------------------------------------------------ */

/** `inviteByPhone`: one invitation naming exactly one V1 human role. */
export const inviteCollabMemberByPhone = (args: CollabInviteCall): Promise<CollabResult<CollabInviteOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "inviteByPhone",
        { phone: args.phone, role: args.role },
        (r) => ({ outcome: r.outcome as CollabInviteOutcome["outcome"], member: r.member as CollabMemberView }),
    );

/** `acceptInvitation`: the invited person's verified phone consumes one invitation. */
export const acceptCollabInvitation = (args: CollabAcceptInvitationCall): Promise<CollabResult<CollabAcceptOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "acceptInvitation",
        { invitationId: args.invitationId, ...(args.displayName === undefined ? {} : { displayName: args.displayName }) },
        (r) => ({ outcome: r.outcome as CollabAcceptOutcome["outcome"], member: r.member as CollabMemberView }),
    );

/** `withdrawInvitation`: a current Owner closes one pending invitation. */
export const withdrawCollabInvitation = (args: CollabWithdrawInvitationCall): Promise<CollabResult<CollabWithdrawOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "withdrawInvitation",
        { invitationId: args.invitationId },
        (r) => ({
            outcome: r.outcome as CollabWithdrawOutcome["outcome"],
            ...(r.member === undefined ? {} : { member: r.member as CollabMemberView }),
        }),
    );

/** `changeMemberRole`: a current Owner replaces one member's role. */
export const changeCollabMemberRole = (args: CollabChangeRoleCall): Promise<CollabResult<CollabChangeMemberRoleOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "changeMemberRole",
        { memberId: args.memberId, role: args.role },
        (r) => ({
            outcome: r.outcome as CollabChangeMemberRoleOutcome["outcome"],
            ...(r.member === undefined ? {} : { member: r.member as CollabMemberView }),
        }),
    );

/** Result re-export so consumers can test `ok` without importing the transport module. */
export type { Result };
