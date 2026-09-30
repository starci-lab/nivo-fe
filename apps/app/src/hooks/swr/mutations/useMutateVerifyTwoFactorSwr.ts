import { verifyTwoFactor } from "@/modules/api/auth"
import { useAuthMutation } from "../useAuthMutation"

/** Own completion of a sign-in that requires an authenticator code. */
export const useMutateVerifyTwoFactorSwr = () => useAuthMutation("verify-two-factor", verifyTwoFactor)
