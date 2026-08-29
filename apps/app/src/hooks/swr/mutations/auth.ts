"use client";

import { useEffect, useRef, useState } from "react";
import useSWRMutation from "swr/mutation";
import { exchangeOauthCode, forgotPasswordInit, forgotPasswordResend, forgotPasswordVerifyOtp, oauthRedirectUrl, signIn, signUpInit, signUpResend, signUpVerifyOtp, type OauthProvider } from "@/modules/api/auth";
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
const PROVIDER_KEY = "nivo.oauth.provider";
const DEFAULT_PROVIDER: OauthProvider = "google";

/** Remember the OAuth provider for the return leg without placing it in the callback URL. */
export const rememberOauthProvider = (provider: OauthProvider) => {
  try {
    window.sessionStorage.setItem(PROVIDER_KEY, provider);
  } catch {
    // Storage can be unavailable; the return hook safely falls back to the offered provider.
  }
};
const takeOauthProvider = (): OauthProvider => {
  try {
    const remembered = window.sessionStorage.getItem(PROVIDER_KEY);
    window.sessionStorage.removeItem(PROVIDER_KEY);
    return remembered === "github" ? "github" : DEFAULT_PROVIDER;
  } catch {
    return DEFAULT_PROVIDER;
  }
};

/** Build the backend-owned provider hand-off URL from the authentication boundary. */
export const authenticationOauthRedirectUrl = (provider: OauthProvider, returnTo: string) => oauthRedirectUrl(provider, returnTo);
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
