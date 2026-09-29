import type { Outcome } from "@/modules/api/outcome";
import type { SalesActionValue, SalesPipelineItem, SalesRequestedAction } from "@/modules/api/sales";

/** The values one Sales copy key interpolates; the surface passes only already-worded text. */
type TranslationValues = Readonly<Record<string, string | number | undefined>>;

/*
 * The Sales workbench's own vocabulary, in one place: which surfaces the block draws, what one read
 * settled into, how a source-owned status is worded, and which recovery door an attributable read
 * opens. Nothing here reads the wire - each function takes what a read already disclosed and answers
 * a question the render half asks.
 */

/** The Sales surfaces this route draws: the operatable surface and the six detail regions it discloses. */
export const SALES_SURFACES = ["opportunity-attention", "boss-command-history", "autonomous-routine-history", "customer-wait-detail", "failure-recovery-detail", "ambiguity-clarification", "won-lost-closure-detail"] as const;
/** One accepted Sales workbench surface. */
export type SalesSurface = (typeof SALES_SURFACES)[number];

/** What one surface's read settled into, in the terms the block renders. */
export type SalesSurfaceStanding = "loading" | "denied" | "unavailable" | "empty" | "ready";

/** One Sales read's answer, as much of it as a standing depends on. */
export type SalesAnswerStanding = Outcome<unknown>;

/** One Sales command's answer, as much of it as settlement depends on. */
export type SalesCommandAnswer = Outcome<unknown>;

/** One Sales command input's naming translation, plus the two plural counts the surface states. */
export type SalesTranslation = (key: string, values?: TranslationValues) => string;

/** The one notice a surface shows after a press: what settled, or why nothing could be claimed. */
export type SalesNotice = { readonly kind: "success" | "refused"; readonly message: string };

/** How a notice is announced: a refusal interrupts, a settled success does not. */
export const salesNoticeLive = (kind: SalesNotice["kind"]): "assertive" | "polite" => kind === "refused" ? "assertive" : "polite";

/*
 * A refusal is not one thing. A denial that hides this installation's records is the only standing
 * the surface calls denied; a stale authority, a conflict, a malformed answer or an unreachable route
 * is an outage the operator can retry, and telling them they lost access would be a lie. An absent
 * answer is a read in flight, never an empty one.
 */

/**
 * Project one read's standing from its answer.
 *
 * @param answer - The read's answer, or undefined while it is still in flight.
 * @param hasContent - Whether the answered payload carries anything to show.
 * @returns The standing the surface renders.
 */
export const salesSurfaceStanding = (answer: SalesAnswerStanding | undefined, hasContent: boolean): SalesSurfaceStanding => {
  if (answer === undefined) return "loading";
  if (!answer.ok) return answer.kind === "refused" || answer.kind === "forbidden" ? "denied" : "unavailable";
  return hasContent ? "ready" : "empty";
};

/** Whether an answer left the effect unattested, which only a read of the same identity resolves. */
export const salesEffectUnattested = (answer: SalesAnswerStanding | undefined): boolean => answer !== undefined && !answer.ok && answer.code === "outcome_unknown";

/** One Sales command input's refusal message key. */
export const salesRefusalKey = (code: string): string => ({
  forbidden: "refusal.forbidden",
  REFUSED: "refusal.forbidden",
  UNAUTHENTICATED: "refusal.signIn",
  SALES_REFUSED_DENIED: "refusal.forbidden",
  SALES_REFUSED_INVALID: "refusal.validation",
  SALES_REFUSED_CONFLICT: "refusal.conflict",
  SALES_REFUSED_UNAVAILABLE: "refusal.unavailable",
  SALES_POLICY_VALUE_INVALID: "refusal.validation",
  outcome_unknown: "refusal.unattested",
  DEADLINE_EXCEEDED: "refusal.unattested",
  UNREACHABLE: "refusal.unreachable",
  MALFORMED_ANSWER: "refusal.malformed",
  UNEXPECTED_RESULT_KIND: "refusal.malformed",
  UNEXPECTED_RESULT_STATUS: "refusal.malformed",
  ECHOED_IDENTITY_MISMATCH: "refusal.malformed",
  BAD_REQUEST: "refusal.validation"
} as Readonly<Record<string, string>>)[code] ?? "refusal.unreachable";

/**
 * One instant as the operator reads it.
 *
 * Sales measures nothing in a business period, so the instant is worded in the one zone every Sales
 * observation is recorded in, and an unreadable value is shown as the source wrote it.
 */
export const formatSalesInstant = (value: string, locale: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short", timeZone: "UTC" }).format(parsed);
};

/** One source-owned operational work state's label key; a state this build does not know stays its own word. */
export const salesWorkStateKey = (workState: string): string | null => ({
  ready: "workState.ready",
  waiting: "workState.waiting",
  attention: "workState.attention"
} as Readonly<Record<string, string>>)[workState] ?? null;

/** One terminal lifecycle status's label key; an undeclared status stays its own word. */
export const salesLifecycleKey = (status: string): string | null => ({
  open: "lifecycle.open",
  won: "lifecycle.won",
  lost: "lifecycle.lost"
} as Readonly<Record<string, string>>)[status] ?? null;

/** One wait or attention reason's label key; a reason this build does not know stays its own word. */
export const salesWorkReasonKey = (reason: string): string | null => ({
  "policy-unset": "workReason.policyUnset",
  "policy-hold": "workReason.policyHold",
  "waiting-customer": "workReason.waitingCustomer",
  "waiting-authority": "workReason.waitingAuthority",
  "needs-clarification": "workReason.needsClarification",
  "needs-follow-up": "workReason.needsFollowUp",
  "outcome-unknown": "workReason.outcomeUnknown"
} as Readonly<Record<string, string>>)[reason] ?? null;

/** One command plan status's label key; an undeclared status stays its own word. */
export const salesCommandStatusKey = (status: string): string | null => ({
  pending: "commandStatus.pending",
  "awaiting-clarification": "commandStatus.awaitingClarification",
  accepted: "commandStatus.accepted",
  rejected: "commandStatus.rejected",
  withdrawn: "commandStatus.withdrawn"
} as Readonly<Record<string, string>>)[status] ?? null;

/** One Sales action status's label key; an undeclared status stays its own word. */
export const salesActionStatusKey = (status: string): string | null => ({
  "not-started": "actionStatus.notStarted",
  started: "actionStatus.started",
  delivered: "actionStatus.delivered",
  waiting: "actionStatus.waiting",
  stopped: "actionStatus.stopped",
  "outcome-unknown": "actionStatus.outcomeUnknown"
} as Readonly<Record<string, string>>)[status] ?? null;

/** One closure outcome's label key. */
export const salesOutcomeKey = (outcome: string): string => ({ won: "outcome.won", lost: "outcome.lost", attention: "outcome.attention" } as Readonly<Record<string, string>>)[outcome] ?? "outcome.attention";

/** One clarification fact as the plan discloses it: exactly one of the two permitted kinds is named. */
export type SalesClarificationFactSource = { readonly customerRef?: unknown; readonly opportunityId?: unknown };

/** One clarification fact's label key: the plan accepts exactly one permitted fact kind. */
export const salesClarificationFactKey = (fact: SalesClarificationFactSource): string =>
  typeof fact.opportunityId === "string" && fact.opportunityId.length > 0 ? "fact.opportunityId" : "fact.customerRef";

/** The closed requested-action vocabulary of the bounded planner, in the one order that canonicalises a press. */
export const SALES_REQUESTED_ACTION_ORDER: ReadonlyArray<SalesRequestedAction> = ["qualify", "contact", "request-decision", "prepare-handoff", "close"];

/**
 * Canonicalise one requested-action control into the closed vocabulary.
 *
 * A press names only actions the planner declares, and the vocabulary's own order makes two
 * spellings of one selection one press: an undeclared word is dropped rather than sent.
 */
export const salesRequestedActions = (value: string): ReadonlyArray<SalesRequestedAction> =>
  SALES_REQUESTED_ACTION_ORDER.filter(action => value.split(",").map(entry => entry.trim()).includes(action));

/** One comma-separated identity list, trimmed and emptied of blanks. */
export const salesIdentityList = (value: string): ReadonlyArray<string> =>
  value.split(",").map(entry => entry.trim()).filter(entry => entry.length > 0);

/** One comma-separated `identity=revision` list as the guard object the command sends, ignoring unparsable entries. */
export const salesExpectedRevisions = (value: string): Readonly<Record<string, number>> =>
  salesIdentityList(value).reduce<Record<string, number>>((revisions, entry) => {
    const separator = entry.lastIndexOf("=");
    const revision = separator < 0 ? Number.NaN : Number(entry.slice(separator + 1).trim());
    return separator > 0 && Number.isSafeInteger(revision) ? { ...revisions, [entry.slice(0, separator).trim()]: revision } : revisions;
  }, {});

/** One Sales action payload, as much of it as the recovery doors depend on. */
export type SalesActionSource = Pick<SalesActionValue, "status" | "receiverReceipt" | "observationGap">;

/** The no-start proof one read attests, or null when it attests none. */
export const salesNoStartProof = (action: SalesActionSource | null): string | null => {
  const proof = action?.receiverReceipt?.noStartProofRef;
  return typeof proof === "string" && proof.length > 0 ? proof : null;
};

/** The worker fence one read discloses, or null when it discloses none. */
export const salesWriterFence = (action: SalesActionSource | null): { readonly claimTokenHash: string; readonly fencedAt: string } | null => {
  const fence = action?.receiverReceipt?.writerFence;
  if (typeof fence !== "object" || fence === null) return null;
  const { claimTokenHash, fencedAt } = fence as { readonly claimTokenHash?: unknown; readonly fencedAt?: unknown };
  return typeof claimTokenHash === "string" && claimTokenHash.length > 0 && typeof fencedAt === "string" && fencedAt.length > 0 ? { claimTokenHash, fencedAt } : null;
};

/**
 * Which recovery door one read opens: retry with the no-start proof it attests, stop with the same
 * durable fence, or none at all.
 *
 * Neither door is offered on an unattributable action: an observation gap means nobody can say
 * whether the attempt started, and a read that discloses no receipt attests neither a proof nor a
 * fence - so the surface holds both controls rather than opening one on a guess.
 */
export const salesRecoveryDoor = (action: SalesActionSource | null): "retry" | "stop" | "hold" => {
  if (action === null || action.observationGap) return "hold";
  if (action.receiverReceipt === null) return "hold";
  if (salesNoStartProof(action) === null) return "hold";
  return salesWriterFence(action) === null ? "hold" : "retry";
};

/**
 * Which action of a command plan a region may read: the plan's own first unconcluded action.
 *
 * The plan discloses only the action identities it produced, so the region reads the first one the
 * plan named and offers the selector for the rest.
 */
export const salesActionIdentityOf = (actionIds: ReadonlyArray<string>, chosen: string): string => chosen.length > 0 ? chosen : actionIds[0] ?? "";

/** Whether a status the read returned is one this build can word; the surface shows the source's word otherwise. */
export const salesWording = (key: string | null, status: string, t: SalesTranslation): string => key === null ? status : t(key);

/** The attention rows of one pipeline page: only the rows whose work state is waiting or attention are attention. */
export const salesAttentionRows = (items: ReadonlyArray<SalesPipelineItem>): ReadonlyArray<SalesPipelineItem> =>
  items.filter(item => item.workState !== "ready");