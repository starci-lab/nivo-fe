import { signIn } from "@/modules/api/auth"
import { useAuthMutation } from "../useAuthMutation"

/** Own the signed-out password exchange. */
export const useMutateSignInSwr = () => useAuthMutation("sign-in", signIn)
