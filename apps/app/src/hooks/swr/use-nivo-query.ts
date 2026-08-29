"use client";

import useSWR, { type SWRConfiguration, type SWRResponse } from "swr";
import { useSession } from "@/modules/auth/session";

/** A product query key before the signed-in viewer identity is attached. */
export type NivoQueryKey = readonly [name: string, ...parts: ReadonlyArray<string | number | boolean | null>];

/** The cache key used by every signed-in Nivo query. */
export type NivoViewerQueryKey = readonly ["NIVO_QUERY", viewerKey: string, ...queryKey: NivoQueryKey];

/** Small transport shape accepted by the shared three-state query-data settlement helper. */
export type NivoQueryAnswer<T> = {
  readonly ok: true;
  readonly data: T;
} | {
  readonly ok: false;
};
const tokenHash = (value: string): string => {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return `opaque-${(hash >>> 0).toString(36)}`;
};

/** Preserve loading, successful data and an explicit refused result as three distinct states. */
export const nivoQueryData = <T,>(answer: NivoQueryAnswer<T> | undefined): T | null | undefined => {
  if (answer === undefined) return undefined;
  return answer.ok ? answer.data : null;
};
const decodeJwtSubject = (accessToken: string): string | null => {
  const payload = accessToken.split(".")[1];
  if (payload === undefined) return null;
  try {
    const normalised = payload.replaceAll("-", "+").replaceAll("_", "/");
    const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, "=");
    const decoded = JSON.parse(globalThis.atob(padded)) as {
      readonly sub?: unknown;
    };
    return typeof decoded.sub === "string" && decoded.sub.length > 0 ? decoded.sub : null;
  } catch {
    return null;
  }
};

/**
 * Produce a viewer-scoped cache identity without ever placing the bearer token in SWR's key.
 * Normal JWT rotation remains on the stable `sub`; malformed local-test tokens get only a
 * one-way process-local fingerprint, so they cannot leak through devtools cache inspection.
 */
export const viewerCacheKeyFor = (accessToken: string): string => decodeJwtSubject(accessToken) ?? tokenHash(accessToken);

/** Build the inspectable cache key without ever retaining the bearer credential itself. */
export const nivoViewerQueryKeyFor = (accessToken: string, queryKey: NivoQueryKey): NivoViewerQueryKey => ["NIVO_QUERY", viewerCacheKeyFor(accessToken), ...queryKey];

/**
 * Own one authenticated server read. Components receive the transport's explicit `Result<T>` and
 * therefore keep operation refusal distinct from loading and from an unexpected thrown failure.
 */
export const useNivoQuery = <TAnswer,>(queryKey: NivoQueryKey | null, query: () => Promise<TAnswer>, config?: SWRConfiguration<TAnswer, Error>): SWRResponse<TAnswer, Error> => {
  const session = useSession();
  const key: NivoViewerQueryKey | null = session.state.status === "signed-in" && typeof session.state.accessToken === "string" && session.state.accessToken.length > 0 && queryKey !== null ? nivoViewerQueryKeyFor(session.state.accessToken, queryKey) : null;
  return useSWR<TAnswer, Error>(key, query, {
    revalidateOnFocus: true,
    ...config
  });
};
