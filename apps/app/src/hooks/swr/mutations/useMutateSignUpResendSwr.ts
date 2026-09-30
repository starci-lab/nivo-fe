import { signUpResend } from "@/modules/api/auth"
import { useAuthMutation } from "../useAuthMutation"

/** Own renewal of an account-creation code. */
export const useMutateSignUpResendSwr = () => useAuthMutation("sign-up-resend", signUpResend)
