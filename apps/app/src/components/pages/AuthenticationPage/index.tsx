"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useMutateContinueBrokeredSignInSwr, useMutateForgotPasswordInitSwr, useMutateForgotPasswordResendSwr, useMutateForgotPasswordVerifyOtpSwr, useMutateSignInSwr, useMutateSignUpInitSwr, useMutateSignUpResendSwr, useMutateSignUpVerifyOtpSwr, useMutateVerifyTwoFactorSwr, useOauthReturnExchange } from "@/hooks";
import { DEFAULT_AUTHENTICATED_LANDING, authenticationOauthRedirectUrl, rememberOauthProvider, validatedReturnTo } from "@/modules/auth";
import { AuthenticationPageView, type AuthenticationPageExit } from "./component";
import type { AuthActions, AuthCode, AuthDetails, AuthFactor, AuthMode, AuthNoticeCopy, AuthPendingAction, AuthProvider, AuthenticationPanelProps } from "@/components/blocks/auth/AuthenticationPanel";
import type { AuthPayload, OtpChallenge } from "@/modules/api/auth";
import { useSession } from "@/modules/auth/session";

/**
 * PAGE - `/authentication`, connected half.
 *
 * IT RESOLVES THE WORLD AND RENDERS ONLY ITS TWIN. Seven mutations, one challenge, one cooldown
 * clock, the mode and the ending live here; `AuthenticationPageView` receives finished values and
 * draws them.
 *
 * THREE JOURNEYS, THREE SHAPES, AND THEY ARE NOT INTERCHANGEABLE:
 *
 * - signIn exchanges a password for a SESSION in one request, and can answer instead with a
 *   two-factor challenge, an UNDECIDED result, or a destination the reader is placed on. Neither
 *   the challenge nor the undecided result is a refusal, so `requiresTwoFactor` and `undecided` are
 *   read BEFORE `accessToken` - a null token is three different things and only one of them means
 *   "wrong password".
 * - signUp mails a code first and only creates the account when the code comes back. It ends three
 *   ways that are not a session: the proven address is already held, the identity was created with
 *   no session, or (after a reset) a password was set. Each is a CONCLUSION whose reason says what
 *   to offer next, and reading `accessToken` alone would show a blank success to somebody who is
 *   not signed in.
 * - forgotPassword mails a code and answers a BOOLEAN at the end. Setting a password is not signing
 *   in, so nothing is adopted and the reader is sent back to sign in.
 *
 * ONE REQUEST IDENTITY PER LOGICAL ATTEMPT. `signIn` takes an idempotency handle so a retry, a
 * timeout and a lost response continue ONE attempt instead of deciding twice. It is minted once,
 * kept while the answer is undecided, and dropped the moment the attempt settles - a new attempt
 * after a refusal is a new request and gets a new identity.
 *
 * THE DESTINATION IS THE BACKEND'S ANSWER, NEVER THE READER'S REQUEST. What arrives on the query is
 * untrusted input; it travels to the backend as `requestedDestination` and the session names the
 * place to land. A requested place the backend could not resolve comes back as the default
 * authenticated landing surface, and that - with a reasonless notice - is what this page shows
 * rather than echoing a place the reader is not allowed into.
 *
 * THE RESET JOURNEY'S REFUSAL IS DELIBERATELY GENERIC. A wrong code and an address nobody has come
 * back as two different exceptions; printing them would let a caller who can read an inbox tell those
 * apart, which is the last place the question "does this person have an account" could leak.
 *
 * THE COOLDOWN IS COUNTED HERE, NOT ASKED FOR. `OTP_RESEND_COOLDOWN_MS` is sixty real seconds and the
 * backend answers `OTP_RESEND_TOO_SOON_EXCEPTION` to anything sooner. It is a LOCAL clock and may
 * drift from the server's; the refusal is still handled, because a countdown that disagrees is not a
 * reason to stop reading the answer.
 *
 * SWITCHING MODE CLEARS EVERYTHING. A challenge belongs to one address on one journey, and carrying
 * it across would offer a reader a code that cannot finish where they now are.
 *
 * THE PROVIDER JOURNEY LEAVES AND COMES BACK TO THIS SAME ADDRESS, which is why it is a fourth
 * journey handled here rather than a route of its own. Pressing the shortcut navigates to the
 * backend's redirect endpoint naming this page as the return address; the backend mints the PKCE
 * pair, keeps the verifier and sends the reader to Keycloak; Keycloak returns them here with `code`
 * and `state` on the query, and the effect below spends that pair for a session. A separate
 * `/callback` screen would be a second surface that could only ever say "please wait" and then
 * repeat this page's own refusal and two-factor endings in its own words.
 *
 * A CALLBACK IS SPENT ONCE AND NEVER RESENT. A brokered result that came back undecided is retried
 * through `continueBrokeredSignIn` under the one-time reference it carries - the handle to the proof
 * the backend is holding for this attempt and this browser, never a callback - so the attempt
 * continues without the code being redeemed a second time. A reference of null says the token
 * exchange itself never answered and nothing could be held, so the fresh provider shortcuts above are
 * the way on. Resending the spent callback is the one thing that would be a replay, and it is not
 * offered.
 *
 * THE VERIFIER IS NEVER HERE. It is generated and held by the backend for the whole round trip, so
 * the worst a script that can read this page can steal is an authorization code it cannot spend.
 */

/**
 * Which step, and in what condition, the screen is in.
 *
 * It lives HERE rather than beside the drawing half, because a phase is a fact about a journey in
 * flight - which request has answered and what it said - and the drawing half deliberately knows
 * nothing about journeys. What it receives is a panel that has already been decided.
 */
export type AuthenticationPageProps = Record<string, never>;
type AuthPhase = "details" | "code" | "done" | "twoFactor" | "notice";

/**
 * Which settled ending without a session is on screen.
 *
 * All five arrive with no form left to fill: the proven mailbox holder, an identity created with
 * no session, a requested destination the backend folded onto the default landing surface, and the
 * two session-ending reports the console hands over on the query.
 */
type AuthNoticeKind = "heldAddress" | "createdNoSession" | "unavailableReturn" | "sessionEndingApplied" | "sessionEndingUnconfirmed";

/**
 * What a brokered answer says, whichever door produced it: the callback's exchange, or the
 * continuation that exchange led to.
 *
 * THE TWO PAYLOADS DIFFER IN ONE FIELD, AND ITS DIRECTION IS THE WHOLE RETRY RULE. An exchange's
 * undecided may carry the handle to a proof the backend is holding for this attempt and this browser;
 * a continuation's own undecided has no such field at all, because a hold that lapsed released
 * nothing and a continuation never hands back another continuation. Reading both through one shape is
 * what lets the ordered branches below be written once instead of copied for the second door.
 */
type BrokeredAnswer = AuthPayload & {
  /** Present only for an unbound subject with no provider-verified email; no identity link, no session. */
  readonly providerEmailRefused: boolean | null;
  /**
   * Present only when the authority did not answer, and each door says it in its own words:
   * `continuationReference` is the handle to a held proof, and only the CALLBACK's undecided can carry
   * one - a continuation repeats the identity read, so its undecided is the same try-again with no
   * further reference at all.
   */
  readonly undecided: null | {
    /** The single-use handle a held proof is continued under; a continuation's undecided carries none. */
    readonly continuationReference?: string | null;
    /** The continuation's own shape of the same answer: nothing to hold, try again. */
    readonly retryWithSameRequest?: boolean;
  };
};

/** How long the resend refuses, in seconds. Mirrors `OTP_RESEND_COOLDOWN_MS` on the backend. */
const RESEND_COOLDOWN_SECONDS = 60;

/** Seconds per minute, so the code hint states a lifetime rather than a raw count. */
const SECONDS_PER_MINUTE = 60;

/**
 * Where the interrupted console route waits across the provider round trip. The provider leg drops
 * this page's query on purpose (see `chooseProvider`), so the address cannot carry it back; the
 * session store can, and it is cleared the moment the reader lands.
 */
const RETURN_TO_STORAGE_KEY = "nivo.auth.return-to";

/**
 * The query key the session-ending hand-off arrives under. `SessionEndingDialog` owns the values
 * it can send; this page only reads them.
 */
const SESSION_ENDING_PARAM = "sessionEnding";

/**
 * What one read of the live address reports upward.
 *
 * `rest` is the query with the hand-off param already taken out, so the consumer can put the
 * address back without re-deriving it - other params, like a return intent, are not this hand-off's
 * to take and stay on it.
 */
type SessionEndingArrival = {
  /** Whether the hand-off param is on the address at all, however it is valued. */
  readonly handedOff: boolean;
  /** The report's known value, or null for anything else. */
  readonly kind: "applied" | "unconfirmed" | null;
  /** The query string left once the param is consumed, empty when none remains. */
  readonly rest: string;
};

/** Props for the hand-off's address reader. */
type SessionEndingQueryProps = {
  /** Receives every successive value the address carries. */
  readonly onParam: (arrival: SessionEndingArrival) => void;
};

/**
 * The hand-off's own reader, subscribing to the live address rather than sampling it.
 *
 * A `useSearchParams` read re-renders on every navigation, which is exactly the hand-off's timing:
 * the custody guard's redirect mounts this page BEFORE the confirmation's navigation appends the
 * answer, so a value that lands after mount is still seen. Prerendering requires the hook under a
 * Suspense boundary, so this leaf reads nothing else and draws nothing.
 *
 * @param props - {@link SessionEndingQueryProps}
 * @returns Nothing - it draws nothing.
 */
const SessionEndingQuery = (props: SessionEndingQueryProps) => {
  const { onParam } = props;
  const searchParams = useSearchParams();
  /*
   * The dependency is the query TEXT, not the read model: a fresh URLSearchParams object every
   * render would refire the report on every render, while the text only changes when the address
   * does - which is exactly when the next successive value is owed.
   */
  const search = searchParams.toString();
  useEffect(() => {
    const query = new URLSearchParams(search);
    const raw = query.get(SESSION_ENDING_PARAM);
    query.delete(SESSION_ENDING_PARAM);
    onParam({
      handedOff: raw !== null,
      kind: raw === "applied" || raw === "unconfirmed" ? raw : null,
      rest: query.toString()
    });
  }, [search, onParam]);
  return null;
};

/**
 * The transport codes that mean NOBODY DECIDED.
 *
 * A request that never arrived, could not be parsed, was refused before any resolver ran, or came
 * back empty is not an answer about the reader's credential - and reporting one as a refusal would
 * tell somebody their password was wrong during an outage. Every one of them is presented as the
 * same non-refusal try-again sentence an undecided result wears.
 */
const UNANSWERED_CODES = new Set(["NETWORK", "MALFORMED", "GRAPHQL", "EMPTY"]);

/**
 * Whether a failed result means the control plane never decided.
 *
 * @param code - The transport's own code, when it published one.
 * @returns Whether the failure is "no answer" rather than a refusal.
 */
const isUnanswered = (code: string | undefined): boolean => code !== undefined && UNANSWERED_CODES.has(code);

/** What the shell's address leaf reported off the live query; null until a hand-off lands. */
type AuthenticationPageConnectedProps = {
  readonly sessionEnding: SessionEndingArrival | null;
};

/**
 * The connected half of the authentication screen.
 *
 * IT TAKES THE HAND-OFF AS A PROP, NOT AS A CHILD. A world-owning render hands every render path
 * to a resolved pure view, so the `useSearchParams` read that must see a late-arriving ending
 * cannot be drawn inside it - the read lives in `SessionEndingQuery`, a leaf that draws nothing,
 * and what it reports arrives through `sessionEnding` like every other settled fact this page
 * consumes.
 *
 * @param props - {@link AuthenticationPageConnectedProps}
 * @returns The page's connected body.
 */
const AuthenticationPageConnected = (props: AuthenticationPageConnectedProps) => {
  const { sessionEnding } = props;
  const t = useTranslations("authentication");
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();
  const signInMutation = useMutateSignInSwr();
  const verifyTwoFactorMutation = useMutateVerifyTwoFactorSwr();
  const signUpInitMutation = useMutateSignUpInitSwr();
  const signUpResendMutation = useMutateSignUpResendSwr();
  const signUpVerifyMutation = useMutateSignUpVerifyOtpSwr();
  const forgotPasswordInitMutation = useMutateForgotPasswordInitSwr();
  const forgotPasswordResendMutation = useMutateForgotPasswordResendSwr();
  const forgotPasswordVerifyMutation = useMutateForgotPasswordVerifyOtpSwr();
  const oauthReturn = useOauthReturnExchange();
  /*
   * THE CONTINUATION'S OWN DOOR, taken as its trigger rather than as the mutation object: the trigger
   * is stable across renders, which is what an effect that continues an attempt needs, and the
   * object's `data` / `isMutating` getters are state this page never reads - the wait is owned by the
   * pending action below, in the same shape every other request on this page wears.
   */
  const { trigger: continueBrokeredSignIn } = useMutateContinueBrokeredSignInSwr();
  const [mode, setMode] = useState<AuthMode>("signIn");
  const [phase, setPhase] = useState<AuthPhase>("details");
  const [noticeKind, setNoticeKind] = useState<AuthNoticeKind | null>(null);
  const [email, setEmail] = useState("");
  const [ttlMinutes, setTtlMinutes] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pendingAction, setPendingAction] = useState<AuthPendingAction | null>(null);
  /*
   * WHICH PROVIDER BUTTON OWNS THE WAIT. Tracked on the way OUT through `chooseProvider`; on the
   * way BACK the whole page has remounted, so the remembered provider is peeked at instead - read
   * only, never taken, because `useOauthReturnExchange` spends it during the exchange. A storage
   * failure or a missing memory degrades to "provider pending, button unknown", which still
   * disables both shortcuts.
   */
  const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(null);
  const [oauthProviderOnArrival] = useState<AuthProvider | null>(() => {
    try {
      const remembered = window.sessionStorage.getItem("nivo.oauth.provider");
      return remembered === "github" || remembered === "google" ? remembered : null;
    } catch {
      return null;
    }
  });
  /*
   * THE PROVIDER'S OWN ANSWER, captured before the exchange hook strips the query. A refused
   * hand-off arrives as `?error=...` with no `code`/`state`, and the hook consumes that and
   * returns nothing - so unless it is read here, in the initializer that runs before any effect,
   * a provider-side refusal would land on a silent sign-in form.
   */
  const [oauthRefusedOnArrival] = useState(() => {
    try {
      const query = new URLSearchParams(window.location.search);
      return query.has("error");
    } catch {
      return false;
    }
  });
  /*
   * THE EVERYWHERE-ENDING'S OWN REPORT, handed over on the address and read REACTIVELY. The console
   * that asked for the ending is gone by the time it could be reported - ending every session
   * clears this browser's custody once the answer arrives - so SessionEndingDialog sends the
   * authority-side answer here the same way the guard sends the interrupted route: one
   * `sessionEnding` value. It can land AFTER this page has already mounted - the guard's own
   * redirect brings the sign-in surface up first and the confirmation's navigation carries the
   * answer a moment later - so `SessionEndingQuery` reads the live address rather than the address
   * at mount. `applied` means the ending was confirmed in every browser; `unconfirmed` means this
   * browser is signed out and the others could not be confirmed, which the notice states as exactly
   * that - never as a completed ending. Any other value is not an answer at all, only a param to
   * consume.
   */
  /*
   * THE SWITCH IS REAL STATE AND IT CHANGES NOTHING SERVER-SIDE YET. The refresh cookie is written
   * with a fixed thirty-day `maxAge` and no per-request control, so a session lasts the same length
   * either way. It is held here rather than dropped because making it mean something is one backend
   * change - the cookie taking its lifetime from this flag - and the control has to exist before
   * that change has anywhere to land.
   */
  const [isRememberMe, setIsRememberMe] = useState(true);
  // Held in a ref rather than state: nothing on screen shows it, and re-rendering to store it would
  // cost the uncontrolled fields their contents.
  const challengeId = useRef("");
  /* The opaque second-factor challenge is held here until the authenticator code is submitted. */
  const twoFactorToken = useRef("");
  /*
   * ONE REQUEST IDENTITY PER LOGICAL SIGN-IN ATTEMPT, held in a ref because nothing draws it and a
   * re-render must not spend a new one. It survives an undecided answer - the same attempt is
   * continued - and it is dropped as soon as the attempt settles, so retrying AFTER a refusal is a
   * genuinely new request rather than a replay of the refused one.
   */
  const signInIdentity = useRef<string | null>(null);
  /*
   * ONE HAND-OFF PER ARRIVAL, held in a ref because the guard has to outlive a re-render and must
   * not cause one. `state` is spent by the first exchange, so a second attempt is refused by
   * design - and development's deliberate double-mounting would otherwise turn a working sign-in
   * into a refusal that appears only on a developer's machine.
   */
  const hasAdoptedOauth = useRef(false);
  /*
   * ONE ENDING REPORT PER ARRIVAL, held in a ref for the same reason as the provider hand-off:
   * the notice settles and the reader moves on, but the param was still on the address when this
   * mount read it - without the guard a re-render would put the consumed report back on screen.
   */
  const hasConsumedSessionEnding = useRef(false);
  /*
   * WHERE THE READER WAS GOING. The console guard sends an anonymous reader here with the route it
   * interrupted on the query, so a sign-in from a deep link ends on that route and not on the home
   * screen. It is read ONCE, at mount, from the address for the same reason the provider return is:
   * a subscription to a query string that never changes under this page buys nothing. It is held in
   * a ref because nothing on screen shows it, and mirrored into the session store so the provider
   * journey, which drops this page's query on the way out, still finds it on the way back.
   *
   * IT IS UNTRUSTED AND IT IS VALIDATED BY THE SEAM'S OWN RULE, not by a second copy written here:
   * `validatedReturnTo` accepts exactly one same-origin path and refuses everything else, and what
   * it refuses is never echoed back to the reader.
   */
  const returnTo = useRef<string | null>(null);
  useEffect(() => {
    const fromAddress = validatedReturnTo(new URLSearchParams(window.location.search).get("returnTo"));
    try {
      if (fromAddress !== null) window.sessionStorage.setItem(RETURN_TO_STORAGE_KEY, fromAddress);
      returnTo.current = fromAddress ?? validatedReturnTo(window.sessionStorage.getItem(RETURN_TO_STORAGE_KEY));
    } catch {
      // A browser that refuses storage still gets the address it arrived with.
      returnTo.current = fromAddress;
    }
  }, []);

  /** Leave for the console, clearing the stored return intent as the reader lands. */
  const arriveAt = useCallback((place: string) => {
    try {
      window.sessionStorage.removeItem(RETURN_TO_STORAGE_KEY);
    } catch {
      // Nothing was stored, so there is nothing to clear.
    }
    router.push(place);
  }, [router]);

  /**
   * Place the reader where the BACKEND resolved the destination, or explain why it did not.
   *
   * The requested place travelled as untrusted input and the answer is the only thing that may be
   * followed. When a place WAS asked for and the answer is a different valid place, the asked-for
   * route was out of reach for this principal: that is said with one reasonless notice rather than
   * with the route's name, and the way on is the default authenticated landing surface.
   *
   * @param resolved - The destination the session named, or null when it named none.
   */
  const landOnDestination = useCallback((resolved: string | null) => {
    const asked = returnTo.current;
    const answered = validatedReturnTo(resolved);
    if (asked !== null && answered !== null && answered !== asked) {
      setNoticeKind("unavailableReturn");
      setPhase("notice");
      return;
    }
    arriveAt(answered ?? asked ?? DEFAULT_AUTHENTICATED_LANDING);
  }, [arriveAt]);

  /**
   * Place the reader where they asked to go, for the endings that name no destination.
   *
   * A provider hand-off and a second factor both answer a session and nothing else, so the place is
   * the validated return intent or the default authenticated landing surface.
   */
  const landOnReturnTo = useCallback(() => {
    arriveAt(returnTo.current ?? DEFAULT_AUTHENTICATED_LANDING);
  }, [arriveAt]);
  useEffect(() => {
    if (cooldownSeconds === 0) return undefined;
    const timer = setTimeout(() => setCooldownSeconds(left => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    const releaseRestoredAction = () => setPendingAction(null);
    window.addEventListener("pageshow", releaseRestoredAction);
    return () => window.removeEventListener("pageshow", releaseRestoredAction);
  }, []);

  /*
   * Memoized because it is not only a press handler any more: the provider return's effect continues
   * a brokered attempt through it, so its identity has to hold still for that effect's own
   * dependency list. Its body touches nothing but the pending setters, which are stable.
   */
  const runPending = useCallback(async <Answer,>(action: AuthPendingAction, request: () => Promise<Answer>): Promise<Answer> => {
    setPendingAction(action);
    try {
      return await request();
    } finally {
      setPendingAction(null);
    }
  }, []);

  /** Put the screen back to a clean first step, keeping only the journey. */
  const clear = () => {
    challengeId.current = "";
    twoFactorToken.current = "";
    setCooldownSeconds(0);
    setStatusMessage("");
    setIsError(false);
    setNoticeKind(null);
    setPhase("details");
  };

  /**
   * Adopt a challenge, whichever request produced it.
   *
   * @param challenge - The handle and its lifetime.
   */
  const adoptChallenge = (challenge: OtpChallenge) => {
    challengeId.current = challenge.challengeId;
    setTtlMinutes(Math.max(1, Math.round(challenge.expiresInSeconds / SECONDS_PER_MINUTE)));
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
  };

  /**
   * Report a refusal in one place, so no branch forgets to stop the spinner.
   *
   * @param reason - The sentence to show.
   */
  const refuse = useCallback((reason: string) => {
    setIsError(true);
    setStatusMessage(reason);
  }, []);

  /**
   * Report an UNDECIDED result the way it deserves: as "nivo did not find out", never as a refusal.
   *
   * @param reason - The try-again sentence for this step.
   */
  const hesitate = useCallback((reason: string) => {
    setIsError(false);
    setStatusMessage(reason);
  }, []);

  /**
   * This logical sign-in attempt's stable identity, minted on first use.
   *
   * @returns The handle, or undefined when the environment cannot mint one.
   */
  const attemptIdentity = (): string | undefined => {
    if (signInIdentity.current === null && typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      signInIdentity.current = crypto.randomUUID();
    }
    return signInIdentity.current ?? undefined;
  };

  /**
   * The request identity this attempt must carry, spread into a mutation's input.
   *
   * @returns One property, or none when no handle could be minted.
   */
  const attemptIdentityInput = (): {
    readonly requestIdentity?: string;
  } => {
    const identity = attemptIdentity();
    return identity === undefined ? {} : {
      requestIdentity: identity
    };
  };

  /*
   * THE PROVIDER'S OWN REFUSAL, shown on arrival rather than discovered. `?error` means the
   * hand-off died upstream - the exchange hook strips the query and settles nothing, so this
   * page says the refusal itself instead of landing the reader on a silent form.
   */
  useEffect(() => {
    if (!oauthRefusedOnArrival) return;
    refuse(t("signIn.oauthRefused"));
  }, [oauthRefusedOnArrival, refuse, t]);

  /*
   * THE HANDED-OFF ENDING IS REPORTED ONCE, THEN THE ADDRESS FORGETS IT. A consumed report left on
   * the query would be announced again on every reload and carried into every shared link, so the
   * param is dropped the moment it is read - whatever it held. A known value settles into the same
   * notice phase the other sessionless endings wear; an unrecognised one is only consumed. The
   * `hasConsumedSessionEnding` ref is the "once": a param still on the address after consumption
   * must not put the notice back on a re-render.
   */
  const consumeSessionEnding = useCallback((arrival: SessionEndingArrival) => {
    if (!arrival.handedOff || hasConsumedSessionEnding.current) return;
    hasConsumedSessionEnding.current = true;
    router.replace(arrival.rest === "" ? pathname : `${pathname}?${arrival.rest}`);
    if (arrival.kind !== null) {
      setNoticeKind(arrival.kind === "applied" ? "sessionEndingApplied" : "sessionEndingUnconfirmed");
      setPhase("notice");
    }
  }, [pathname, router]);
  /*
   * Each read the leaf reports is offered to the consumer once it lands; the ref inside keeps the
   * first hand-off, so repeats of the same address and bare-query reads after it is stripped are
   * spent by the guard rather than by another branch here.
   */
  useEffect(() => {
    if (sessionEnding !== null) consumeSessionEnding(sessionEnding);
  }, [sessionEnding, consumeSessionEnding]);

  /*
   * THE RETURN LEG OF A PROVIDER SIGN-IN.
   *
   * THE QUERY IS READ FROM THE ADDRESS RATHER THAN FROM `useSearchParams`. That hook makes the
   * whole route client-rendered unless it is wrapped in a boundary, and what is wanted here is one
   * read at mount rather than a subscription to a query string that never changes under this page.
   *
   * THE QUERY IS CLEARED BEFORE THE EXCHANGE, NOT AFTER. `state` is single-use, so a reader who
   * reloads mid-flight would otherwise replay a handle the backend has already spent and be told
   * their sign-in failed when it did not - and the code would sit in the address bar, in history,
   * and in whatever the reader pastes into a support ticket.
   *
   * FOUR ANSWERS ARE READ IN ORDER, AND NONE OF THEM IS A SESSION YET. A challenge is read before a
   * token because `session.adopt` ignores a payload that still owes a second factor. An unbound
   * subject with no provider-verified email is a RECOVERABLE refusal - no identity was linked, so
   * both provider shortcuts and the password path stay fresh, and the exits below the surface
   * already offer registration and sign-in. A brokered undecided result says the authority did not
   * answer; it is NOT a refusal, the callback is NOT resent, and the reference it carries is spent
   * here as a CONTINUATION of the same attempt instead.
   */
  useEffect(() => {
    /**
     * Settle one brokered answer - the callback's exchange, or the continuation it led to.
     *
     * THE ORDER IS THE CONTRACT'S AND IT IS NOT NEGOTIABLE. A second factor and an unverified
     * provider email are ANSWERS rather than failures, so they are read before any token; and
     * `undecided` is read before `accessToken`, because a null token beside it says nobody decided
     * rather than "wrong".
     *
     * AN UNDECIDED RESULT IS CONTINUED, NEVER RESENT. The callback has been spent, so sending it
     * again would be the replay the journey refuses; the reference it carries addresses the proof the
     * backend is holding for this attempt and this browser instead, and asking under it repeats the
     * identity read alone. A continuation's own undecided carries no further reference - its payload
     * has no field for one - so this walk of the outcomes ends, and with no reference at all the
     * fresh provider shortcuts above are the way on.
     *
     * @param first - The brokered payload, from the callback or from its continuation.
     */
    const settleBrokered = async (first: BrokeredAnswer): Promise<void> => {
      if (first.requiresTwoFactor) {
        twoFactorToken.current = first.twoFactorToken ?? "";
        setStatusMessage("");
        setPhase("twoFactor");
        return;
      }
      if (first.providerEmailRefused === true) {
        refuse(t("signIn.oauthEmailRefused"));
        return;
      }
      if (first.undecided !== null) {
        const reference = first.undecided.continuationReference ?? null;
        if (reference === null) {
          hesitate(t("signIn.oauthUndecided"));
          return;
        }
        const continued = await runPending("provider", () => continueBrokeredSignIn({
          continuationReference: reference
        }));
        if (!continued.ok) {
          if (isUnanswered(continued.code)) hesitate(t("signIn.oauthUndecided"));
          else refuse(t("signIn.oauthRefused"));
          return;
        }
        await settleBrokered(continued.data);
        return;
      }
      if (first.accessToken === null) {
        refuse(t("signIn.oauthRefused"));
        return;
      }
      session.adopt(first);
      landOnReturnTo();
    };
    const result = oauthReturn.answer;
    if (result === undefined || hasAdoptedOauth.current) return;
    hasAdoptedOauth.current = true;
    if (!result.ok) {
      if (isUnanswered(result.code)) hesitate(t("signIn.oauthUndecided"));
      else refuse(t("signIn.oauthRefused"));
      return;
    }
    void settleBrokered(result.data);
  }, [continueBrokeredSignIn, hesitate, landOnReturnTo, oauthReturn.answer, refuse, runPending, session, t]);

  /**
   * Submit the first step of whichever journey is running.
   *
   * @param details - The email, and the password on the journeys that ask for one.
   */
  const submitDetails = async (details: AuthDetails): Promise<void> => {
    setIsError(false);
    setStatusMessage("");
    if (mode === "signIn") {
      const result = await runPending("submit", () => signInMutation.trigger({
        email: details.email,
        password: details.password,
        ...attemptIdentityInput(),
        ...(returnTo.current === null ? {} : {
          requestedDestination: returnTo.current
        })
      }));
      if (!result.ok) {
        // THE ATTEMPT IS STILL OPEN CONCEPTUALLY when nobody answered, so the identity stays.
        if (isUnanswered(result.code)) {
          hesitate(t("signIn.undecided"));
          return;
        }
        signInIdentity.current = null;
        refuse(t("signIn.refused"));
        return;
      }
      if (result.data.requiresTwoFactor) {
        signInIdentity.current = null;
        twoFactorToken.current = result.data.twoFactorToken ?? "";
        setStatusMessage("");
        setPhase("twoFactor");
        return;
      }
      if (result.data.undecided !== null) {
        hesitate(t("signIn.undecided"));
        return;
      }
      if (result.data.accessToken === null) {
        signInIdentity.current = null;
        refuse(t("signIn.refused"));
        return;
      }
      signInIdentity.current = null;
      session.adopt(result.data);
      landOnDestination(result.data.destination);
      return;
    }
    const result = await runPending("submit", () => mode === "signUp" ? signUpInitMutation.trigger({
      email: details.email,
      password: details.password,
      ...(details.name === "" ? {} : {
        name: details.name
      })
    }) : forgotPasswordInitMutation.trigger({
      email: details.email
    }));
    if (!result.ok) {
      /*
       * THE MAIL-SIDE SENTENCE, not a generic one. Both journeys talk about a code that has NOT
       * been sent, and the sentence says so - no delivery is claimed, and no account exists as a
       * result of this request.
       */
      refuse(mode === "signUp" ? t("signUp.mailRefused") : t("forgotPassword.mailRefused"));
      return;
    }
    setEmail(details.email);
    adoptChallenge(result.data);
    setPhase("code");
  };

  /**
   * Spend the mailed code.
   *
   * @param code - The code, and the new password on the journey that sets one.
   */
  const submitCode = async (code: AuthCode): Promise<void> => {
    setIsError(false);
    setStatusMessage("");
    if (mode === "signUp") {
      const result = await runPending("submit", () => signUpVerifyMutation.trigger({
        challengeId: challengeId.current,
        otp: code.otp
      }));
      if (!result.ok) {
        if (isUnanswered(result.code)) {
          hesitate(t("signUp.undecided"));
          return;
        }
        refuse(t("signUp.codeRefused"));
        return;
      }
      if (result.data.requiresTwoFactor) {
        twoFactorToken.current = result.data.twoFactorToken ?? "";
        setStatusMessage("");
        setPhase("twoFactor");
        return;
      }
      /*
       * A CONCLUSION IS A DELIBERATE ENDING WITH NO SESSION. The proof was good and the mailbox was
       * proved; what the authoritative check found afterwards is the whole instruction for what the
       * screen offers next - signing in to the identity already there, or signing in with the
       * password just set. Neither is a refusal and neither may be shown as one.
       */
      if (result.data.conclusion !== null) {
        if (result.data.conclusion.reason === "heldAddress") {
          setNoticeKind("heldAddress");
          setPhase("notice");
          return;
        }
        if (result.data.conclusion.reason === "registeredSignInRequired") {
          setNoticeKind("createdNoSession");
          setPhase("notice");
          return;
        }
        setPhase("done");
        return;
      }
      if (result.data.undecided !== null) {
        hesitate(t("signUp.undecided"));
        return;
      }
      if (result.data.accessToken === null) {
        refuse(t("signUp.codeRefused"));
        return;
      }
      // A brand new account has no second factor, so there is no challenge to read for here. The
      // journey finishes ON the done surface rather than being routed away mid-sentence: the
      // account exists, the session is adopted, and `onward` is the reader's own way in.
      session.adopt(result.data);
      setPhase("done");
      return;
    }
    const result = await runPending("submit", () => forgotPasswordVerifyMutation.trigger({
      challengeId: challengeId.current,
      otp: code.otp,
      newPassword: code.newPassword
    }));
    if (!result.ok) {
      if (isUnanswered(result.code)) {
        hesitate(t("signUp.undecided"));
        return;
      }
      // ONE SENTENCE FOR BOTH REFUSALS. `result.reason` is deliberately not shown.
      refuse(t("forgotPassword.codeRefused"));
      return;
    }
    setStatusMessage("");
    setPhase("done");
  };

  /** Spend the authenticator challenge and adopt the resulting session. */
  const submitFactor = async (factor: AuthFactor): Promise<void> => {
    setIsError(false);
    setStatusMessage("");
    const result = await runPending("submit", () => verifyTwoFactorMutation.trigger({
      twoFactorToken: twoFactorToken.current,
      code: factor.code
    }));
    if (!result.ok) {
      if (isUnanswered(result.code)) {
        hesitate(t("signIn.undecided"));
        return;
      }
      refuse(t("signIn.twoFactorRefused"));
      return;
    }
    if (result.data.requiresTwoFactor || result.data.accessToken === null) {
      refuse(t("signIn.twoFactorRefused"));
      return;
    }
    session.adopt(result.data);
    landOnReturnTo();
  };

  /** Ask for another code. Refused inside the cooldown, which the control already says. */
  const resend = async (): Promise<void> => {
    const result = await runPending("resend", () => mode === "signUp" ? signUpResendMutation.trigger({
      challengeId: challengeId.current
    }) : forgotPasswordResendMutation.trigger({
      challengeId: challengeId.current
    }));
    if (!result.ok) {
      refuse(t("resendRefused"));
      return;
    }
    adoptChallenge(result.data);
    setIsError(false);
    setStatusMessage(t("resentLabel"));
  };

  /** Switch journey, which drops whatever challenge the previous one held. */
  const changeMode = (next: AuthMode) => {
    setMode(next);
    clear();
  };

  /**
   * The first way out of a settled notice, which is what the notice's primary action does.
   *
   * Only the unavailable-return notice keeps the session: the reader IS signed in there, and the
   * action is the way onto the default landing surface.
   */
  const takeNoticePrimary = () => {
    if (noticeKind === "unavailableReturn") {
      arriveAt(DEFAULT_AUTHENTICATED_LANDING);
      return;
    }
    changeMode("signIn");
  };

  /** The second way out, offered only where the record names two: sign in, or reset the password. */
  const takeNoticeSecondary = () => {
    if (noticeKind === "heldAddress") changeMode("forgotPassword");
  };

  /**
   * Everything the panel can do, in one place so each state hands over the same set.
   *
   * `onward` is the only one that reads the current ending: a settled notice's own way on, the
   * reset journey's return to signing in, and otherwise the console.
   */
  const actions: AuthActions = {
    submitDetails: details => {
      void submitDetails(details);
    },
    submitCode: code => {
      void submitCode(code);
    },
    submitFactor: factor => {
      void submitFactor(factor);
    },
    resend: () => {
      void resend();
    },
    back: clear,
    changeRememberMe: setIsRememberMe,
    changeMode,
    chooseProvider: provider => {
      /*
       * A FULL-PAGE NAVIGATION RATHER THAN `router.push`. The destination is the backend, which
       * answers 302 towards Keycloak. Next's router moves between this app's own routes and has
       * nowhere to send this; and the reader genuinely leaves - the whole point of the trip is
       * that it happens outside this document.
       *
       * THE RETURN ADDRESS IS THIS PAGE WITH ITS QUERY AND HASH DROPPED. Dropped, because the
       * backend replays that string verbatim at the token exchange and Keycloak compares the
       * two - so anything that could differ between the leg out and the leg back has to go.
       * This page, because the reader came from here and should land back in the language they
       * left from; `pathname` already carries the locale prefix when there is one.
       *
       * THE PROVIDER BUTTON OWNS THE WAIT. `pageshow` releases that pending state when Back restores
       * this document from the browser cache, so progress is visible without creating a dead end.
       */
      rememberOauthProvider(provider);
      setIsError(false);
      setStatusMessage("");
      setPendingAction("provider");
      setPendingProvider(provider);
      const returnUrl = `${window.location.origin}${window.location.pathname}`;
      window.location.assign(authenticationOauthRedirectUrl(provider, returnUrl));
    },
    onward: () => {
      if (phase === "notice") {
        takeNoticePrimary();
        return;
      }
      if (mode === "forgotPassword") {
        changeMode("signIn");
        return;
      }
      if (phase === "twoFactor") {
        clear();
        return;
      }
      landOnReturnTo();
    },
    onwardSecondary: () => {
      if (phase === "notice") takeNoticeSecondary();
    }
  };
  /*
   * A SIGNED-IN READER DOES NOT GET THE FORM. The restore effect signs somebody in without this
   * page lifting a finger, so an already-adopted session lands on the route it interrupted rather
   * than staring at credentials it does not need. While custody is still being verified the
   * surface owes only a wait - the form would offer controls that cannot be honoured yet.
   */
  const isRestoring = session.state.status === "restoring";
  const isSignedInArrival = session.state.status === "signed-in" && phase === "details";
  useEffect(() => {
    if (isSignedInArrival) landOnReturnTo();
  }, [isSignedInArrival, landOnReturnTo]);
  const frame = {
    title: t(`${mode}.title`),
    subtitle: t(`${mode}.subtitle`),
    isPending: pendingAction !== null || oauthReturn.isMutating,
    pendingAction: oauthReturn.isMutating ? "provider" as const : pendingAction ?? undefined,
    pendingProvider: pendingProvider ?? oauthProviderOnArrival ?? undefined
  };

  /**
   * The settled notice's whole copy, resolved from the ending that produced it.
   *
   * @returns The notice's slots.
   */
  const noticeCopy = (): AuthNoticeCopy => {
    const base = {
      ...frame,
      statusMessage: "",
      isError: false,
      doneTitle: "",
      doneHint: "",
      onwardLabel: "",
      secondaryLabel: ""
    };
    if (noticeKind === "heldAddress") {
      return {
        ...base,
        doneTitle: t("signUp.heldAddressTitle"),
        doneHint: t("signUp.emailTaken"),
        onwardLabel: t("signUp.heldAddressSignInLabel"),
        secondaryLabel: t("signUp.heldAddressRecoverLabel")
      };
    }
    if (noticeKind === "createdNoSession") {
      return {
        ...base,
        doneTitle: t("signUp.createdNoSessionTitle"),
        doneHint: t("signUp.createdNoSessionNotice"),
        onwardLabel: t("signUp.createdNoSessionSignInLabel")
      };
    }
    /*
     * THE EVERYWHERE-ENDING'S TWO REPORTS. `applied` may say the ending was confirmed in every
     * browser; `unconfirmed` must not - this browser is signed out and the others were never
     * confirmed, which is not a success. The way on is the same single action: the sign-in form.
     */
    if (noticeKind === "sessionEndingApplied") {
      return {
        ...base,
        doneHint: t("signOut.everywhereAppliedNotice"),
        onwardLabel: t("forgotPassword.onwardLabel")
      };
    }
    if (noticeKind === "sessionEndingUnconfirmed") {
      return {
        ...base,
        doneHint: t("signOut.unconfirmedNotice"),
        onwardLabel: t("forgotPassword.onwardLabel")
      };
    }
    /*
     * REASONLESS, AND WITH NO HEADING OF ITS OWN. The notice says the place is unavailable and that
     * the reader has been taken to the default page; naming the route they asked for, or why it was
     * refused, would report what this principal may reach.
     */
    return {
      ...base,
      doneHint: t("unavailableReturnNotice"),
      onwardLabel: t("signUp.onwardLabel")
    };
  };

  /**
   * What is offered below the surface: the other journey, and the way back from a challenge.
   *
   * @returns The exits in reading order.
   */
  const exits = (): ReadonlyArray<AuthenticationPageExit> => {
    if (isRestoring || isSignedInArrival || phase === "done" || phase === "notice") return [];
    const switchTo: AuthMode = mode === "signIn" ? "signUp" : "signIn";
    const prompt = {
      question: t(`${mode}.promptQuestion`),
      action: t(`${mode}.promptAction`),
      onPress: () => changeMode(switchTo)
    };
    if (phase === "twoFactor") {
      return [{
        question: "",
        action: t("signIn.backLabel"),
        onPress: clear
      }];
    }
    if (phase === "code") {
      return [{
        question: "",
        action: t("backLabel"),
        onPress: clear
      }, prompt];
    }
    return [prompt];
  };

  /*
   * THE PANEL'S SITUATION, RESOLVED HERE AND HANDED OVER WHOLE. Every string is read as
   * `<mode>.<key>` out of one namespace, so a fourth journey would be a catalogue change rather
   * than a branch - and the drawing half never learns which language it is in.
   *
   * FOUR SITUATIONS, SETTLED ONE AT A TIME. Each phase answers with the whole panel and leaves, so
   * a reader confirms the situation in front of them without holding the other three open while
   * they read it. The order still matters and is the journey's own: a settled ending outranks a
   * challenge, a challenge outranks a finished journey, and the details are where every journey
   * starts.
   */
  const panelFor = (): AuthenticationPanelProps => {
    if (isRestoring || isSignedInArrival) {
      return {
        state: "restoring",
        props: {
          title: t("restoringTitle"),
          subtitle: t("restoringSubtitle"),
          progressLabel: t("restoringLabel")
        },
        on: actions
      };
    }
    if (phase === "notice") {
      return {
        state: "notice",
        props: noticeCopy(),
        on: actions
      };
    }
    if (phase === "twoFactor") {
      return {
        state: "secondFactor",
        props: {
          ...frame,
          subtitle: t("signIn.twoFactorSubtitle"),
          statusMessage,
          isError,
          codeLabel: t("codeLabel"),
          codeRequired: t("codeRequired"),
          codeInvalid: t("codeInvalid"),
          submitLabel: t("signIn.twoFactorSubmitLabel"),
          backLabel: t("signIn.backLabel")
        },
        on: actions
      };
    }
    if (phase === "done") {
      return {
        state: "done",
        props: {
          ...frame,
          statusMessage,
          isError,
          doneTitle: t(`${mode}.doneTitle`),
          doneHint: t(`${mode}.doneHint`),
          onwardLabel: t(`${mode}.onwardLabel`),
          secondaryLabel: ""
        },
        on: actions
      };
    }
    if (phase === "code") {
      return {
        state: "code",
        props: {
          ...frame,
          mode,
          subtitle: t(`${mode}.codeSubtitle`, {
            email
          }),
          statusMessage,
          isError,
          codeLabel: t("codeLabel"),
          codeRequired: t("codeRequired"),
          codeInvalid: t("codeInvalid"),
          codeHint: t("codeHint", {
            minutes: ttlMinutes
          }),
          newPasswordLabel: t("newPasswordLabel"),
          newPasswordPlaceholder: t("newPasswordPlaceholder"),
          newPasswordRequired: t("newPasswordRequired"),
          newPasswordTooShort: t("newPasswordTooShort"),
          newPasswordHint: t("newPasswordHint"),
          confirmNewPasswordLabel: t("confirmNewPasswordLabel"),
          confirmNewPasswordPlaceholder: t("confirmNewPasswordPlaceholder"),
          confirmNewPasswordRequired: t("confirmNewPasswordRequired"),
          confirmNewPasswordMismatch: t("confirmNewPasswordMismatch"),
          revealLabel: t("revealLabel"),
          hideLabel: t("hideLabel"),
          submitLabel: t(`${mode}.codeSubmitLabel`),
          resendLabel: t("resendLabel"),
          cooldownLabel: cooldownSeconds === 0 ? "" : t("cooldownLabel", {
            seconds: cooldownSeconds
          }),
          backLabel: t("backLabel")
        },
        on: actions
      };
    }
    return {
      state: "details",
      props: {
        ...frame,
        mode,
        statusMessage,
        isError,
        emailLabel: t("emailLabel"),
        emailPlaceholder: t("emailPlaceholder"),
        emailRequired: t("emailRequired"),
        emailInvalid: t("emailInvalid"),
        emailHint: t("emailHint"),
        passwordLabel: t("passwordLabel"),
        passwordPlaceholder: mode === "signUp" ? t("newAccountPasswordPlaceholder") : t("passwordPlaceholder"),
        passwordRequired: t("passwordRequired"),
        passwordTooShort: t("passwordTooShort"),
        passwordHint: t("passwordHint"),
        confirmPasswordLabel: t("confirmPasswordLabel"),
        confirmPasswordPlaceholder: t("confirmPasswordPlaceholder"),
        confirmPasswordRequired: t("confirmPasswordRequired"),
        confirmPasswordMismatch: t("confirmPasswordMismatch"),
        nameLabel: t("nameLabel"),
        namePlaceholder: t("namePlaceholder"),
        nameHint: t("nameOptionalHint"),
        nameTooLong: t("nameTooLong"),
        authorityHint: t("signUp.authorityHint"),
        revealLabel: t("revealLabel"),
        hideLabel: t("hideLabel"),
        submitLabel: t(`${mode}.submitLabel`),
        orLabel: t("orLabel"),
        googleLabel: t("googleLabel"),
        githubLabel: t("githubLabel"),
        forgotPasswordLabel: t("forgotPasswordLabel"),
        rememberMeLabel: t("rememberMeLabel"),
        isRememberMe
      },
      on: actions
    };
  };
  const panel = panelFor();
  return <AuthenticationPageView panel={panel} exits={exits()} />;
};

/**
 * The authentication screen.
 *
 * A PURE SHELL HOLDS THE TWO HALVES APART. The connected body resolves the world and hands every
 * render path to its pure twin, so the `useSearchParams` read cannot sit inside it; the read lives
 * in `SessionEndingQuery` under this shell's own Suspense boundary, which is where prerendering
 * wants the hook anyway. What the leaf reports is relayed down to the connected body as an
 * ordinary prop - the leaf draws nothing, and the shell itself owns no world state.
 *
 * @returns The page.
 */
export const AuthenticationPage = (props: AuthenticationPageProps) => {
  void props;
  const [sessionEnding, setSessionEnding] = useState<SessionEndingArrival | null>(null);
  return <>
    <Suspense fallback={null}>
      <SessionEndingQuery onParam={setSessionEnding} />
    </Suspense>
    <AuthenticationPageConnected sessionEnding={sessionEnding} />
  </>;
};