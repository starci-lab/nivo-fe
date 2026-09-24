"use client";

import useSWRMutation from "swr/mutation";
import { continueBrokeredSignIn } from "@/modules/api/auth";
type AuthMutationTrigger<TInput> = {
  readonly arg: TInput;
};

/** Own one public authentication command; unlike viewer mutations it is intentionally signed-out. */
const useAuthMutation = <TAnswer, TInput>(key: string, mutation: (input: TInput) => Promise<TAnswer>) => useSWRMutation(["NIVO_AUTH_MUTATION", key] as const, (_key, {
  arg
}: AuthMutationTrigger<TInput>) => mutation(arg));

/**
 * Own the continuation of a brokered sign-in whose verified proof the authority has not mapped yet.
 *
 * THIS IS NOT A SECOND CALLBACK. The callback that produced the undecided result was spent when its
 * code was redeemed, so it can never be sent twice; what this spends is the single-use reference
 * that result carried to the proof the backend is holding for this attempt and this browser.
 */
export const useMutateContinueBrokeredSignInSwr = () => useAuthMutation("continue-brokered-sign-in", continueBrokeredSignIn);