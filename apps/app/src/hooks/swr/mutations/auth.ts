"use client";

import { useEffect, useRef, useState } from "react";
import useSWRMutation from "swr/mutation";
import { continueBrokeredSignIn, exchangeOauthCode, forgotPasswordInit, forgotPasswordResend, forgotPasswordVerifyOtp, signIn, signOut, signUpInit, signUpResend, signUpVerifyOtp, verifyTwoFactor } from "@/modules/api/auth";
import { takeOauthProvider } from "@/modules/auth";
type AuthMutationTrigger<TInput> = {
  readonly arg: TInput;
};

/** Own one public authentication command; unlike viewer mutations it is intentionally signed-out. */
const useAuthMutation = <TAnswer, TInput>(key: string, mutation: (input: TInput) => Promise<TAnswer>) => useSWRMutation(["NIVO_AUTH_MUTATION", key] as const, (_key, {
  arg
}: AuthMutationTrigger<TInput>) => mutation(arg));

/** Own the signed-out password exchange. */
export const useMutateSignInSwr = () => useAuthMutation("sign-in", signIn);
/** Own completion of a sign-in that requires an authenticator code. */
export const useMutateVerifyTwoFactorSwr = () => useAuthMutation("verify-two-factor", verifyTwoFactor);
/** Own the first step of mailed-code account creation. */
export const useMutateSignUpInitSwr = () => useAuthMutation("sign-up-init", signUpInit);
/** Own renewal of an account-creation code. */
export const useMutateSignUpResendSwr = () => useAuthMutation("sign-up-resend", signUpResend);
/** Own the account-creation code exchange. */
export const useMutateSignUpVerifyOtpSwr = () => useAuthMutation("sign-up-verify", signUpVerifyOtp);
/** Own the first step of password recovery. */
export const useMutateForgotPasswordInitSwr = () => useAuthMutation("forgot-password-init", forgotPasswordInit);
/** Own renewal of a password-recovery code. */
export const useMutateForgotPasswordResendSwr = () => useAuthMutation("forgot-password-resend", forgotPasswordResend);
/** Own the password-recovery code exchange. */
export const useMutateForgotPasswordVerifyOtpSwr = () => useAuthMutation("forgot-password-verify", forgotPasswordVerifyOtp);
/**
 * Own the continuation of a brokered sign-in whose verified proof the authority has not mapped yet.
 *
 * THIS IS NOT A SECOND CALLBACK. The callback that produced the undecided result was spent when its
 * code was redeemed, so it can never be sent twice; what this spends is the single-use reference
 * that result carried to the proof the backend is holding for this attempt and this browser.
 */
export const useMutateContinueBrokeredSignInSwr = () => useAuthMutation("continue-brokered-sign-in", continueBrokeredSignIn);
/**
 * Own ending a session, and carry the answers the ending states BESIDE its payload.
 *
 * IT IS THE ENVELOPE DOOR, NOT THE PAYLOAD DOOR. `signOut`'s `data` reports only that the request
 * completed - the resolver clears this browser's refresh cookie whether or not the provider's
 * best-effort revoke did anything - while whether that revocation was observed, and whether an
 * everywhere scope's own ending was confirmed by the identity authority, arrive as SIBLINGS of the
 * payload. Unwrapping `data` here would leave every caller to guess both, so the whole envelope
 * travels through `useAuthMutation` unchanged.
 */
export const useMutateSignOutSwr = () => useAuthMutation("sign-out", signOut);
type OauthReturnAnswer = Awaited<ReturnType<typeof exchangeOauthCode>>;

/**
 * Spend an OAuth return exactly once. The hook owns the network effect so the page only reacts to
 * the settled authentication result and never imports or invokes transport from a component effect.
 */
export const useOauthReturnExchange = () => {
  const exchange = useAuthMutation("oauth-exchange", exchangeOauthCode);
  const [answer, setAnswer] = useState<OauthReturnAnswer>();
  const hasExchanged = useRef(false);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get("code");
    const state = query.get("state");
    const wasRefused = query.has("error");
    if ((code === null || state === null) && !wasRefused) return;
    if (hasExchanged.current) return;
    hasExchanged.current = true;
    const provider = takeOauthProvider();
    window.history.replaceState(null, "", window.location.pathname);
    if (code === null || state === null) return;
    void exchange.trigger({
      code,
      provider,
      state
    }).then(setAnswer);
  }, [exchange]);
  return {
    answer,
    isMutating: exchange.isMutating
  };
};
