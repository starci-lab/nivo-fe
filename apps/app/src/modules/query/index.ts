import type { FailureKind } from "@/modules/api/outcome";

/**
 * How a caller reads one settled query answer.
 *
 * The transport under `@/modules/api` produces the answer and the hooks under
 * `@/hooks` deliver it; neither owns the reading of it. Keeping that reading
 * here gives a connected component one import that is not a hook and not the
 * transport, which is what both boundaries require: the hooks barrel names
 * hooks only, and a component may not import a runtime value from the transport
 * folder (`component-runtime-transport-import`).
 */

/** The narrowest answer shape the settlement helpers accept; every `Outcome<T>` satisfies it. */
export type NivoQueryAnswer<T> = {
  readonly ok: true;
  readonly data: T;
} | {
  readonly ok: false;
  readonly kind: FailureKind;
};

/** Preserve loading, successful data and an explicit refused result as three distinct states. */
export const nivoQueryData = <T,>(answer: NivoQueryAnswer<T> | undefined): T | null | undefined => {
  if (answer === undefined) return undefined;
  return answer.ok ? answer.data : null;
};

/**
 * Whether a settled answer says the viewer may not have this: the session is not accepted, or the
 * session may not read it. Every other failure is a fault the viewer could retry.
 */
export const nivoAnswerDenied = (answer: NivoQueryAnswer<unknown> | undefined): boolean =>
  answer !== undefined && !answer.ok && (answer.kind === "refused" || answer.kind === "forbidden");
