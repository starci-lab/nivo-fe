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

/** What a caller may do with the session. */
export interface Session {
  /** The current state. */
  readonly state: SessionState;
  /** Adopt the payload an auth mutation just returned. Ignores a payload still owing a factor. */
  readonly adopt: (payload: AuthPayload) => void;
  /** Drop the session here and on the server. */
  readonly end: () => Promise<void>;
}
const SessionContext = createContext<Session | null>(null);

/** Props for {@link SessionProvider}. */
export interface SessionProviderProps {
  /** Everything that may read the session. */
  readonly children: ComponentProps<"div">["children"];
}

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
    token.current = payload.accessToken;
    setState({
      status: "signed-in",
      accessToken: payload.accessToken
    });
  }, []);
  const end = useCallback(async () => {
    /*
     * The local state is cleared FIRST. If the network call fails the reader is still signed out
     * of this tab, which is the outcome they asked for; the alternative leaves somebody staring
     * at a console they just tried to leave.
     */
    token.current = null;
    setState({
      status: "anonymous"
    });
    await signOutMutation();
  }, []);
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      const result = await refreshSession();
      if (cancelled) {
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
