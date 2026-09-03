"use client";

import { useEffect, useRef, useState } from "react";
import useSWRMutation from "swr/mutation";
import { exchangeOauthCode, forgotPasswordInit, forgotPasswordResend, forgotPasswordVerifyOtp, signIn, signUpInit, signUpResend, signUpVerifyOtp } from "@/modules/api/auth";
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
