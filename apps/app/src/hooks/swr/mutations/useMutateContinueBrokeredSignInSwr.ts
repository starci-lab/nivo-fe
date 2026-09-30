
import { continueBrokeredSignIn } from "@/modules/api/auth"
import { useAuthMutation } from "../useAuthMutation"

/**
 * Own the continuation of a brokered sign-in whose verified proof the authority has not mapped yet.
 *
 * THIS IS NOT A SECOND CALLBACK. The callback that produced the undecided result was spent when its
 * code was redeemed, so it can never be sent twice; what this spends is the single-use reference
 * that result carried to the proof the backend is holding for this attempt and this browser.
 */
export const useMutateContinueBrokeredSignInSwr = () =>
    useAuthMutation("continue-brokered-sign-in", continueBrokeredSignIn)
