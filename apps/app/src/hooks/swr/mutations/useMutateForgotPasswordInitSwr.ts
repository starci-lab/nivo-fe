import { forgotPasswordInit } from "@/modules/api/auth"
import { useAuthMutation } from "../useAuthMutation"

/** Own the first step of password recovery. */
export const useMutateForgotPasswordInitSwr = () => useAuthMutation("forgot-password-init", forgotPasswordInit)
