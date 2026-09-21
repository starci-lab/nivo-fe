"use client";

import { useLocale } from "next-intl";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { refreshSession, signOut as signOutMutation, type AuthPayload } from "../api/auth";
import { useAccessTokenFrom, useLocaleFrom } from "../api/graphql";

/**
 * Who is signed in, for as long as this tab is open.
 *
 * THE ACCESS TOKEN LIVES IN MEMORY AND NOWHERE ELSE. Not `localStorage`, not a readable cookie: both
 * are readable by any script that reaches this page, and a token in either survives the tab that
 * earned it. What survives a reload instead is the HttpOnly refresh cookie the backend wrote, which
 * script cannot touch - so a returning reader is restored by ASKING the server, not by reading
 * storage. The cost is one round trip on first paint, and it buys a token no XSS can lift.
 *
 * THREE STATES, NOT A BOOLEAN. `restoring` is a real answer and it is not the same as `signed-out`:
 * a route that redirected on `!session` would bounce every returning reader to the sign-in screen
 * for the length of that round trip, which is the classic flash this shape exists to prevent.
 *
 * IT DRAWS NOTHING. This file holds no markup and decides no layout - it is the session, which is
 * app infrastructure rather than a component tier, and it lives under `modules/` for that reason.
 */

/** Whether anybody is signed in, and whether that answer is settled yet. */
export type SessionState = /** The refresh cookie is being traded for a token; nobody knows yet. */
{
  readonly status: "restoring";
}
/** No credential, and that is settled. */ | {
  readonly status: "anonymous";
}
/** A live access token, held only in memory. */ | {
  readonly status: "signed-in";
  readonly accessToken: string;
};

/**
 * What ending a session actually observed, told apart the way the custody contract demands.
 *
 * `signOut` on the wire answers only that the request completed: the resolver clears the refresh
 * cookie and returns `true` whether or not the provider's revocation was observed - its revoke is
 * best-effort and swallows failures. Reading that as "revoked remotely" would describe a
 * revocation nobody saw, so honesty is `unknown` until the API reports the outcome separately.
 */
export type SessionEndReport = {
  /** Local access state and the browser's refresh custody are gone either way. */
  readonly localCleared: true;
  /** Whether provider revocation was observed; never inflated from a merely completed request. */
  readonly remoteRevocation: "observed" | "unknown";
};

/** What a caller may do with the session. */
export type Session = {
  /** The current state. */
  readonly state: SessionState;
  /** Adopt the payload an auth mutation just returned. Ignores a payload still owing a factor. */
  readonly adopt: (payload: AuthPayload) => void;
  /** Drop the session here and on the server, and report what the server actually confirmed. */
  readonly end: () => Promise<SessionEndReport>;
};
const SessionContext = createContext<Session | null>(null);

/** Props for {@link SessionProvider}. */
export type SessionProviderProps = {
  /** Everything that may read the session. */
  readonly children: ComponentProps<"div">["children"];
};

/**
 * Hold the session above every route.
 *
 * @param props - {@link SessionProviderProps}
 * @returns The provided tree.
 */
export const SessionProvider = (props: SessionProviderProps) => {
  const { children } = props;
  const [state, setState] = useState<SessionState>({
    status: "restoring"
  });

  /*
   * A REF BESIDE THE STATE, because the transport reads the token during a fetch rather than during
   * a render. Reading React state from that callback would hand it whichever value was captured
   * when the reader was installed - the one that expired.
   */
  const token = useRef<string | null>(null);
  useAccessTokenFrom(useCallback(() => token.current, []));

  /*
   * A CUSTODY EPOCH BESIDE THE TOKEN, because a refresh answer can arrive after a newer custody
   * decision already settled. `adopt` and `end` each bump it; the restore below applies its result
   * only while the epoch is still the one it started under. A losing or late observation - a
   * refusal that was overtaken by a sign-in, or a success that was overtaken by a sign-out - must
   * never clear or overwrite the newer custody result.
   */
  const custodyEpoch = useRef(0);

  /*
   * THE TRANSPORT ASKS FOR THE LANGUAGE THE SAME WAY IT ASKS FOR THE TOKEN, and for the same
   * reason: it must not import the routing runtime. A refusal sentence comes from the API, so the
   * API has to be told which language to refuse in.
   */
  const locale = useLocale();
  useLocaleFrom(useCallback(() => locale, [locale]));
  const adopt = useCallback((payload: AuthPayload) => {
    /*
     * A payload that still owes a second factor is NOT a session. Adopting it would put `null`
     * in the token and leave the app believing somebody is signed in.
     */
    if (payload.requiresTwoFactor || payload.accessToken === null) {
      return;
    }
    custodyEpoch.current += 1;
    token.current = payload.accessToken;
    setState({
      status: "signed-in",
      accessToken: payload.accessToken
    });
  }, []);
  const end = useCallback(async (): Promise<SessionEndReport> => {
    /*
     * The local state is cleared FIRST. If the network call fails the reader is still signed out
     * of this tab, which is the outcome they asked for; the alternative leaves somebody staring
     * at a console they just tried to leave. Bumping the epoch also retires any refresh still in
     * flight, so its answer cannot put a session back after this one was ended.
     */
    custodyEpoch.current += 1;
    token.current = null;
    setState({
      status: "anonymous"
    });
    /*
     * The mutation's `data` reports a completed request, not an observed revocation: the resolver
     * answers `true` whether the provider revoke succeeded, failed or never ran, so the report
     * below can only ever be `unknown` until the API names the outcome.
     */
    await signOutMutation();
    return {
      localCleared: true,
      remoteRevocation: "unknown"
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      const epochAtStart = custodyEpoch.current;
      const result = await refreshSession();
      if (cancelled || custodyEpoch.current !== epochAtStart) {
        return;
      }
      if (result.ok && !result.data.requiresTwoFactor && result.data.accessToken !== null) {
        token.current = result.data.accessToken;
        setState({
          status: "signed-in",
          accessToken: result.data.accessToken
        });
        return;
      }
      /*
       * EVERY OTHER OUTCOME IS ANONYMOUS, including a network failure. A reader whose refresh
       * could not be answered is not signed in, and pretending the question is still open would
       * leave the app restoring forever.
       */
      setState({
        status: "anonymous"
      });
    };
    void restore();
    return () => {
      cancelled = true;
    };
  }, []);
  const value = useMemo<Session>(() => ({
    state,
    adopt,
    end
  }), [state, adopt, end]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

/**
 * Read the session.
 *
 * @returns The session held above this component.
 */
export const useSession = (): Session => {
  const session = useContext(SessionContext);
  if (session === null) {
    throw new Error("useSession was called outside SessionProvider");
  }
  return session;
};
