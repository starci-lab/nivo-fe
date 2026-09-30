import { signUpVerifyOtp } from "@/modules/api/auth"
import { useAuthMutation } from "../useAuthMutation"

/** Own the account-creation code exchange. */
export const useMutateSignUpVerifyOtpSwr = () => useAuthMutation("sign-up-verify", signUpVerifyOtp)
