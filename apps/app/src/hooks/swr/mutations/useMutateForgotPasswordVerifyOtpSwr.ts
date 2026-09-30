import { forgotPasswordVerifyOtp } from "@/modules/api/auth"
import { useAuthMutation } from "../useAuthMutation"

/** Own the password-recovery code exchange. */
export const useMutateForgotPasswordVerifyOtpSwr = () =>
    useAuthMutation("forgot-password-verify", forgotPasswordVerifyOtp)
