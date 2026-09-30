import { signUpInit } from "@/modules/api/auth"
import { useAuthMutation } from "../useAuthMutation"

/** Own the first step of mailed-code account creation. */
export const useMutateSignUpInitSwr = () => useAuthMutation("sign-up-init", signUpInit)
