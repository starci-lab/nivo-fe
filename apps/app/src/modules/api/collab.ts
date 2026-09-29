/**
 * Collab Office data layer - one tagged member request to one named Collab operation
 * (`contract.collab.chat`, `contract.collab.task-read`, `contract.collab.member-invite`,
 * `contract.collab.module-work`, `contract.collab.turn-notice`; mirrored from
 * `impl.collab.nivo-backend.gateway`).
 *
 * WHAT IS SETTLED. The backend ships one served ingress,
 * `CollabGatewayResolver` on the shared authenticated core GraphQL endpoint: the query
 * field `collabGatewayRead` carries the closed read ops and the mutation field
 * `collabGatewayCommand` the closed command ops (`contract.collab.chat` rev 5,
 * `sds.collab.chat-gateway` rev 4, `impl.collab.nivo-backend.gateway`). Each takes one
 * `CollabGatewayRequest {workspaceId, op, input}` and returns one typed
 * `CollabGatewayReply` - never throws. The verified-bearer guard derives the actor
 * (Login principal plus its `email_verified` email); the request carries only the
 * workspace scope, the operation name and the domain input. This module mirrors that
 * closed operation set and its projections one-for-one; it owns no second task
 * authority, keeps no optimistic copies, and never attests a role, grant, principal,
 * email or phone it was not given.
 *
 * MEMBER COMMANDS AND INVITATION IDENTITY. This round invites by email
 * (`decision.collab.invite-identity-this-round`, `contract.collab.member-invite` rev 4):
 * `inviteByEmail` carries the invitee's email and one role as domain input, and
 * `acceptInvitation` carries only the invitation identity - the accepting email is the
 * bearer's Login-verified email, never an input field. No phone field exists anywhere
 * in this layer. The four member ops answer under the result record's `membership`
 * field, whose `outcome` is the membership service's decided domain result.
 *
 * VIEWER AND ROSTER IDENTITY. The `openOffice` result carries the requesting member's own
 * `viewer {memberId, role}` and each roster entry's stable identity - `memberId` for a
 * human, `moduleInstallationId` for a hired module - resolved by the server from current
 * membership in the same authorized read (`contract.collab.chat` rev 5,
 * `sds.collab.workspace-chat` rev 2, `contract.collab.task-read` rev 3). The viewer is a
 * presentation hint for the approved role-gated invite and approval controls, never a
 * grant and never inferred client-side from the session token, roster order or a display
 * name; the roster identities are what a Tasks person or module filter matches.
 *
 * WHY NOT `graphql()`. The shared client unwraps the `GraphQLTransformInterceptor`
 * envelope `{success, message, error, data}`; a gateway reply is itself the typed
 * answer (`{ok:true, op, result}` / `{ok:false, failure}`) and would be mangled by that
 * unwrap. So this module sends its own document through `graphqlFields` and reads the
 * field payload bare, the same way `chatbotCoreRequest` does for the chatbot gateway.
 *
 * WHY FAILURE KIND AND RETRYABILITY SURVIVE. The contract separates a non-disclosing
 * denial (a foreign or former member learns nothing, retrying is pointless) from an
 * unavailable or unknown outcome (safe to reconcile and retry). Collapsing them into one
 * `ok:false` is exactly how a client invents work or leaks a workspace boundary, so
 * the shared `Outcome` keeps `kind`, `code` and `retryable`: a denial is `forbidden` or `refused`,
 * a conflict is `invalid` under `COLLAB_CONFLICT`, and only `unavailable` says try again.
 */

import { graphqlFields } from "./graphql"
import { failed, type FailureKind, type Outcome } from "./outcome"
import type { CollabTurnState } from "../collab"

/** The served query field the closed read ops travel on (`CollabGatewayResolver`). */
export const COLLAB_GATEWAY_READ_FIELD = "collabGatewayRead";

/** The served mutation field the closed command ops travel on (`CollabGatewayResolver`). */
export const COLLAB_GATEWAY_COMMAND_FIELD = "collabGatewayCommand";

/**
 * The closed named-operation set one member request resolves to
 * (`contract.collab.chat` rev 5): the eight read ops travel on `collabGatewayRead`, the
 * six command ops on `collabGatewayCommand`; an op on the wrong field or outside this
 * set is refused as invalid before any Collab operation runs.
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
    | "inviteByEmail"
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

/** The failure vocabulary the gateway states on the wire; member-visible denial never discloses scope. */
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
 * The tagged reply the gateway returns. `op` echoes the operation answered so a
 * caller can never mistake which request a page belongs to.
 */
export type CollabGatewayReply = {
    readonly ok: true;
    readonly op: CollabOperation;
    readonly result: Record<string, unknown>;
} | {
    readonly ok: false;
    readonly failure: CollabFailure;
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

/** One participant row of the current Office roster; never carries an email, phone or principal. */
export type CollabOfficeParticipant = {
    /** Durable identity of the member row - the identity a task's asker and assignee reference. */
    readonly memberId: string;
    readonly kind: "human" | "module";
    readonly displayName: string;
    readonly role: string;
    readonly status: string;
    /**
     * The hired module's installation identity on a module entry - the same identity a
     * task's owning module reference and a Tasks module filter use (`contract.collab.chat`
     * rev 5, `contract.collab.task-read` rev 3); null on a human entry.
     */
    readonly moduleInstallationId: string | null;
};

/**
 * The requesting member's own active membership identity and its one current role
 * (`contract.collab.chat` rev 5, `sds.collab.workspace-chat` rev 2): resolved by
 * `sds.collab.membership-service` for the derived Login principal in the same authorized
 * read, never from request input and never returned to a non-member. A presentation hint
 * for the approved role-gated controls (the invite action only for a current Owner or
 * Manager, active approval buttons only for a current Manager or Owner); every command
 * still rechecks the actor's current authority at commit.
 */
export type CollabOfficeViewer = {
    /** The viewer's own active member identity. */
    readonly memberId: string;
    /** The viewer's one current Owner, Manager or Staff role. */
    readonly role: CollabHumanRole;
};

/** The Office landing bundle: the one group, its current roster and the requesting viewer. */
export type CollabOfficeView = {
    readonly group: CollabGroupView;
    readonly participants: ReadonlyArray<CollabOfficeParticipant>;
    /** The requesting member's own member identity and current role. */
    readonly viewer: CollabOfficeViewer;
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

/** Public projection of one member row; never carries an email, phone or principal. */
export type CollabMemberView = {
    readonly memberId: string;
    readonly workspaceId: string;
    readonly kind: "human" | "module";
    readonly displayName: string;
    readonly role: string;
    readonly status: string;
};

/**
 * The membership record every member command answers under the result record's
 * `membership` field: the decided domain result plus the invitation or member row
 * after the decision, when one exists. `notAuthorized`/`notEntitled` come back as
 * non-disclosing `denied` failures, `invalidInput` as `invalid` and `lostRace` as
 * `conflict` - they never reach this shape (`contract.collab.member-invite` rev 4).
 */
export type CollabMembershipResult = {
    readonly outcome: "created" | "existing" | "accepted" | "withdrawn" | "roleChanged";
    readonly member?: CollabMemberView;
};

/** Outcome of `inviteByEmail`; `existing` covers duplicate and raced submissions. */
export type CollabInviteOutcome = {
    readonly outcome: "created" | "existing";
    readonly member?: CollabMemberView;
};

/** Outcome of `acceptInvitation`; `existing` replays the first committed acceptance. */
export type CollabAcceptOutcome = {
    readonly outcome: "accepted" | "existing";
    readonly member?: CollabMemberView;
};

/** Outcome of `withdrawInvitation`; acceptance and withdrawal have one winner. */
export type CollabWithdrawOutcome = {
    readonly outcome: "withdrawn" | "existing";
    readonly member?: CollabMemberView;
};

/** Outcome of `changeMemberRole`; `existing` is the idempotent same-role replay. */
export type CollabChangeMemberRoleOutcome = {
    readonly outcome: "roleChanged" | "existing";
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

/** What the ingress answered for one request: the operation echoed and its own result record. */
export type CollabServed = {
    readonly op: CollabOperation;
    readonly result: Record<string, unknown>;
};

/** How one tagged member request travels; the app binds exactly one implementation. */
export type CollabTransport = (call: CollabTransportCall) => Promise<Outcome<CollabServed>>;

/** Which shared failure kind each failure the gateway states on the wire is. */
const COLLAB_FAILURE_KIND_MAP: Readonly<Record<CollabFailureKind, FailureKind>> = {
    unauthenticated: "refused",
    denied: "forbidden",
    invalid: "invalid",
    conflict: "invalid",
    unavailable: "unavailable",
    unknown: "unavailable",
};

const collabFailure = (
    kind: CollabFailureKind,
    code: string,
    reason: string,
    retryable: boolean,
) => failed(COLLAB_FAILURE_KIND_MAP[kind], { code, reason, retryable });

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

/** Reject anything that is not the boundary's own reply shape before trusting it. */
const readReply = (value: unknown): CollabGatewayReply | null => {
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
 * What one reply of the gateway says, as the shared outcome: the served operation and its result
 * record, or the failure kind the gateway stated under its own `COLLAB_<KIND>` code.
 */
export const collabOutcomeOfReply = (reply: CollabGatewayReply): Outcome<CollabServed> => {
    if (reply.ok) {
        return { ok: true, data: { op: reply.op, result: reply.result } };
    }
    return collabFailure(reply.failure.kind, `COLLAB_${reply.failure.kind.toUpperCase()}`, reply.failure.reason, reply.failure.retryable);
};

/**
 * The default binding: one tagged-request document to the shared core GraphQL endpoint,
 * `collabGatewayRead` for reads and `collabGatewayCommand` for writes - the door
 * `CollabGatewayResolver` serves (`sds.collab.chat-gateway` rev 4). The request argument
 * is exactly `{workspaceId, op, input}`; the field's GraphQLJSON payload is the typed
 * outcome itself, read bare rather than through the shared envelope unwrap.
 */
export const collabGatewayTransport: CollabTransport = async ({ accessToken, request }) => {
    const field = COLLAB_READ_OPERATIONS.has(request.op)
        ? COLLAB_GATEWAY_READ_FIELD
        : COLLAB_GATEWAY_COMMAND_FIELD;
    const document = COLLAB_READ_OPERATIONS.has(request.op)
        ? `query CollabGateway($request: CollabGatewayRequest!) { ${field}(request: $request) }`
        : `mutation CollabGateway($request: CollabGatewayRequest!) { ${field}(request: $request) }`;
    const answered = await graphqlFields(document, { request }, { accessToken });
    if (!answered.ok) {
        return answered;
    }
    const reply = readReply(answered.data[field]);
    if (reply === null) {
        return collabFailure("unknown", "COLLAB_UNKNOWN", "malformed", true);
    }
    return collabOutcomeOfReply(reply);
};

/**
 * The transport in force. Defaults to the GraphQL tagged-request binding; the session
 * root or a future live channel swaps it through `setCollabTransport` without the
 * operation vocabulary or the hooks changing.
 */
let transport: CollabTransport = collabGatewayTransport;

/**
 * Bind the transport every Collab call travels on.
 *
 * THE MODULE-SIDE DOOR, beside {@link setCollabLocaleReader}: a component binds through the
 * `useCollabTransportFrom` hook (`@/hooks`), while a `modules/` owner calls this setter
 * directly.
 *
 * @param next - The transport in force from here on.
 */
export const setCollabTransport = (next: CollabTransport) => {
    transport = next;
};

/** Send one tagged member request and preserve the boundary's own failure vocabulary. */
const collabRequest = async <T>(
    accessToken: string,
    workspaceId: string,
    op: CollabOperation,
    input: Readonly<Record<string, unknown>>,
    pick: (result: Record<string, unknown>) => T,
): Promise<Outcome<T>> => {
    if (accessToken === "") {
        return collabFailure("unauthenticated", "COLLAB_UNAUTHENTICATED", "sign-in required", false);
    }
    if (workspaceId === "") {
        return collabFailure("invalid", "COLLAB_INVALID", "workspaceId required", false);
    }
    let served: Outcome<CollabServed>;
    try {
        served = await transport({ accessToken, request: { workspaceId, op, input } });
    } catch {
        return collabFailure("unknown", "COLLAB_UNKNOWN", "transport threw", true);
    }
    if (!served.ok) {
        return served;
    }
    try {
        return { ok: true, data: pick(served.data.result) };
    } catch {
        // An ok outcome whose result record is not the op's own shape is
        // untrusted wire data, not a crash: a retryable unknown, never success.
        return collabFailure("unknown", "COLLAB_UNKNOWN", "malformed result", true);
    }
};

/** One named field of an ok result record, or a thrown malformed marker. */
const readResultField = (result: Record<string, unknown>, field: string): Record<string, unknown> => {
    const value = result[field];
    if (!isRecord(value)) {
        throw new Error(`${field} result missing`);
    }
    return value;
};

/** The `membership` result record of a member command, or a thrown malformed marker. */
const readMembershipResult = (result: Record<string, unknown>): CollabMembershipResult => {
    const membership = readResultField(result, "membership");
    if (typeof membership.outcome !== "string") {
        throw new Error("membership outcome missing");
    }
    return membership as CollabMembershipResult;
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

/**
 * `inviteByEmail`: the invitee's email and its one role. The email is domain input
 * naming the invited person, never the actor - normalization (trim, case) is the
 * boundary's job, not this adapter's.
 */
export type CollabInviteCall = CollabCallScope & {
    readonly email: string;
    readonly role: CollabHumanRole;
};

/**
 * `acceptInvitation`: the invitation identity and optional display name. The accepting
 * email is the bearer's Login-verified email derived by the ingress - this call can
 * never carry an accepter email, phone, role, grant or principal.
 */
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

/** `openOffice`: a current member lands in the one Office group with its roster and viewer identity. */
export const openCollabOffice = (args: CollabCallScope): Promise<Outcome<CollabOfficeView>> =>
    collabRequest(args.accessToken, args.workspaceId, "openOffice", {}, (r) => readResultField(r, "office") as CollabOfficeView);

/** `readGroup`: the authorized conversation page under a resumable cursor. */
export const readCollabGroup = (args: CollabPageCall): Promise<Outcome<CollabGroupRead>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "readGroup",
        { ...(args.cursor === undefined ? {} : { cursor: args.cursor }), ...(args.limit === undefined ? {} : { limit: args.limit }) },
        (r) => readResultField(r, "page") as CollabGroupRead,
    );

/** The `postMessage` answer: the admission disposition plus any bound question-answer. */
export type CollabPostMessageOutcome = {
    readonly route: CollabRouteOutcome;
    readonly answer?: CollabAnswerBinding;
};

/**
 * Claim fields no Collab command ever accepts from a caller, mirrored from the ingress
 * (`sds.collab.chat-gateway` rev 4 Asker grant derivation): the actor comes only from
 * the verified bearer, so a transported grant, role, member identity, principal,
 * verified-email claim, phone or membership claim is refused before the request leaves
 * the adapter. `inviteByEmail`'s own domain fields (`email`, `role`) and
 * `changeMemberRole`'s (`memberId`, `role`) name the invitee or target, never the actor.
 */
const FORBIDDEN_AUTHORITY_CLAIMS = new Set([
    "askerGrantScope", "askerGrant", "grant", "grantScope", "role", "actorRole",
    "memberId", "member", "membership", "membershipId", "membershipClaims", "isMember",
    "principal", "loginPrincipal", "sub", "email", "verifiedEmail", "emailVerified", "email_verified",
    "phone", "verifiedPhone", "actor",
]);

/**
 * Refuse a call that smuggles an authority or identity claim the ingress must never
 * read from input, before the request leaves the adapter. The op's own domain fields
 * that happen to share a claim name (`inviteByEmail`'s `email`/`role`,
 * `changeMemberRole`'s `memberId`/`role`) are passed in `allowed` - they name the
 * invitee or target, never the actor.
 */
const rejectAuthorityClaims = (op: string, args: Readonly<Record<string, unknown>>, allowed: ReadonlyArray<string>): Outcome<never> | null => {
    const claim = Object.keys(args).find((key): boolean => FORBIDDEN_AUTHORITY_CLAIMS.has(key) && !allowed.includes(key));
    return claim === undefined
        ? null
        : collabFailure("invalid", "COLLAB_INVALID", `${op} does not accept ${claim}; the ingress derives actor identity from the verified bearer.`, false);
};

/**
 * `postMessage`: commit one message under its stable intent identity. The caller supplies
 * `intentId` - a resend MUST reuse the same identity, and a changed body under a reused
 * identity is a refusal, not an edit. `route` is the admission answer; `answer` carries
 * the bound question-answer when the message closed one.
 */
export const postCollabMessage = (args: CollabPostMessageCall): Promise<Outcome<CollabPostMessageOutcome>> => {
    const refused = rejectAuthorityClaims("postMessage", args, []);
    if (refused !== null) {
        return Promise.resolve(refused);
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
            route: readResultField(r, "route") as CollabRouteOutcome,
            ...(r.answer === undefined ? {} : { answer: r.answer as CollabAnswerBinding }),
        }),
    );
};

/** `pressApprovalButton`: the exact card, the exact two-button control value. */
export const pressCollabApprovalButton = (args: CollabPressApprovalCall): Promise<Outcome<CollabPressApprovalButtonOutcome>> => {
    const refused = rejectAuthorityClaims("pressApprovalButton", args, []);
    if (refused !== null) {
        return Promise.resolve(refused);
    }
    return collabRequest(
        args.accessToken,
        args.workspaceId,
        "pressApprovalButton",
        { approvalId: args.approvalId, button: args.button },
        (r) => readResultField(r, "press") as CollabPressApprovalButtonOutcome,
    );
};

/** `listTasks`: the authorized Tasks page; every filter is presentation only. */
export const listCollabTasks = (args: CollabListTasksCall): Promise<Outcome<CollabTaskList>> =>
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
        (r) => readResultField(r, "page") as CollabTaskList,
    );

/** `readTask`: the same authoritative task the Office card reads, plus its card target. */
export const readCollabTask = (args: CollabReadTaskCall): Promise<Outcome<CollabReadTaskOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "readTask",
        { taskId: args.taskId },
        (r) => readResultField(r, "read") as CollabReadTaskOutcome,
    );

/** `availableCommands`: resolve one typed `@` name to its published command set. */
export const readCollabAvailableCommands = (args: CollabCommandsCall): Promise<Outcome<CollabAvailableCommandsOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "availableCommands",
        { moduleName: args.moduleName },
        (r) => readResultField(r, "offer") as CollabAvailableCommandsOutcome,
    );

/** `readNotices`: the member's outstanding turn notices under a resumable cursor. */
export const readCollabNotices = (args: CollabPageCall): Promise<Outcome<CollabTurnNoticePage>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "readNotices",
        { ...(args.cursor === undefined ? {} : { cursor: args.cursor }), ...(args.limit === undefined ? {} : { limit: args.limit }) },
        (r) => readResultField(r, "page") as CollabTurnNoticePage,
    );

/** `openNotice`: follow one named notice to its live authoritative target. */
export const openCollabNotice = (args: CollabOpenNoticeCall): Promise<Outcome<CollabOpenTurnNoticeOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "openNotice",
        { noticeId: args.noticeId },
        (r) => readResultField(r, "notice") as CollabOpenTurnNoticeOutcome,
    );

/**
 * `reconcileRequest`: the same-intent read a caller takes before any resend after an
 * uncertain submit. `matched` returns the durable binding and its receiver-owned
 * receipt; an intent that committed is never resent.
 */
export const reconcileCollabRequest = (args: CollabReconcileCall): Promise<Outcome<CollabReconcileOutcome>> =>
    collabRequest(
        args.accessToken,
        args.workspaceId,
        "reconcileRequest",
        { intentId: args.intentId },
        (r) => readResultField(r, "reconcile") as CollabReconcileOutcome,
    );

/* ------------------------------------------------------------------ */
/* Membership operations - the member-invite contract ops. The ingress */
/* orchestrates them into the membership boundary and answers them     */
/* under the result record's `membership` field.                       */
/* ------------------------------------------------------------------ */

/** `inviteByEmail`: one invitation naming exactly one V1 human role. */
export const inviteCollabMemberByEmail = (args: CollabInviteCall): Promise<Outcome<CollabInviteOutcome>> => {
    const refused = rejectAuthorityClaims("inviteByEmail", args, ["email", "role"]);
    if (refused !== null) {
        return Promise.resolve(refused);
    }
    return collabRequest(
        args.accessToken,
        args.workspaceId,
        "inviteByEmail",
        { email: args.email, role: args.role },
        (r) => {
            const membership = readMembershipResult(r);
            return {
                outcome: membership.outcome as CollabInviteOutcome["outcome"],
                ...(membership.member === undefined ? {} : { member: membership.member }),
            };
        },
    );
};

/**
 * `acceptInvitation`: the bearer's Login-verified email consumes one invitation. The
 * call carries only the invitation identity and an optional display name - never an
 * accepter email, phone, role, grant or principal, which the guard above refuses.
 */
export const acceptCollabInvitation = (args: CollabAcceptInvitationCall): Promise<Outcome<CollabAcceptOutcome>> => {
    const refused = rejectAuthorityClaims("acceptInvitation", args, []);
    if (refused !== null) {
        return Promise.resolve(refused);
    }
    return collabRequest(
        args.accessToken,
        args.workspaceId,
        "acceptInvitation",
        { invitationId: args.invitationId, ...(args.displayName === undefined ? {} : { displayName: args.displayName }) },
        (r) => {
            const membership = readMembershipResult(r);
            return {
                outcome: membership.outcome as CollabAcceptOutcome["outcome"],
                ...(membership.member === undefined ? {} : { member: membership.member }),
            };
        },
    );
};

/** `withdrawInvitation`: a current Owner closes one pending invitation. */
export const withdrawCollabInvitation = (args: CollabWithdrawInvitationCall): Promise<Outcome<CollabWithdrawOutcome>> => {
    const refused = rejectAuthorityClaims("withdrawInvitation", args, []);
    if (refused !== null) {
        return Promise.resolve(refused);
    }
    return collabRequest(
        args.accessToken,
        args.workspaceId,
        "withdrawInvitation",
        { invitationId: args.invitationId },
        (r) => {
            const membership = readMembershipResult(r);
            return {
                outcome: membership.outcome as CollabWithdrawOutcome["outcome"],
                ...(membership.member === undefined ? {} : { member: membership.member }),
            };
        },
    );
};

/** `changeMemberRole`: a current Owner replaces one member's role. */
export const changeCollabMemberRole = (args: CollabChangeRoleCall): Promise<Outcome<CollabChangeMemberRoleOutcome>> => {
    const refused = rejectAuthorityClaims("changeMemberRole", args, ["memberId", "role"]);
    if (refused !== null) {
        return Promise.resolve(refused);
    }
    return collabRequest(
        args.accessToken,
        args.workspaceId,
        "changeMemberRole",
        { memberId: args.memberId, role: args.role },
        (r) => {
            const membership = readMembershipResult(r);
            return {
                outcome: membership.outcome as CollabChangeMemberRoleOutcome["outcome"],
                ...(membership.member === undefined ? {} : { member: membership.member }),
            };
        },
    );
};

