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

/** The narrowest answer shape the settlement helper accepts; every `Result<T>` satisfies it. */
export type NivoQueryAnswer<T> = {
  readonly ok: true;
  readonly data: T;
} | {
  readonly ok: false;
};

/** Preserve loading, successful data and an explicit refused result as three distinct states. */
export const nivoQueryData = <T,>(answer: NivoQueryAnswer<T> | undefined): T | null | undefined => {
  if (answer === undefined) return undefined;
  return answer.ok ? answer.data : null;
};
