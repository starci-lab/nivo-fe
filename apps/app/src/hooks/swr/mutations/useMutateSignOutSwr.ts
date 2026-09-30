
import { signOut } from "@/modules/api/auth"
import { useAuthMutation } from "../useAuthMutation"

/**
 * Own ending a session, and carry the answers the ending states BESIDE its payload.
 *
 * IT IS THE ENVELOPE DOOR, NOT THE PAYLOAD DOOR. `signOut`'s `data` reports only that the request
 * completed - the resolver clears this browser's refresh cookie whether or not the provider's
 * best-effort revoke did anything - while whether that revocation was observed, and whether an
 * everywhere scope's own ending was confirmed by the identity authority, arrive as SIBLINGS of the
 * payload. Unwrapping `data` here would leave every caller to guess both, so the whole envelope
 * travels through `useAuthMutation` unchanged.
 */
export const useMutateSignOutSwr = () => useAuthMutation("sign-out", signOut)
