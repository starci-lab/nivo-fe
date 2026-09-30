import { forgotPasswordResend } from "@/modules/api/auth"
import { useAuthMutation } from "../useAuthMutation"

/** Own renewal of a password-recovery code. */
export const useMutateForgotPasswordResendSwr = () => useAuthMutation("forgot-password-resend", forgotPasswordResend)
