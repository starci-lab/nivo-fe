import { DEFAULT_AUTHENTICATED_LANDING, validatedReturnTo } from "@/modules/auth"
import { UNAVAILABLE_RETURN_LANDING } from "@/modules/auth/authentication"
import { OAUTH_PROVIDER_KEY, readStored, RETURN_TO_STORAGE_KEY } from "@/modules/browser-storage"

/** Initial navigation facts carried through a provider round trip. */
export type AuthenticationArrival = {
    readonly provider: "google" | "github" | null
    readonly refused: boolean
}

/** Read the validated return intent once, falling back to the value saved before provider navigation. */
export const readAuthenticationReturnToFromBrowser = (): string | null => {
    if (typeof window === "undefined") return null
    return readAuthenticationReturnTo(window.location.search, readStored("session", RETURN_TO_STORAGE_KEY))
}

/** Read only the provider label and refusal marker from the arriving address. */
export const readAuthenticationArrival = (): AuthenticationArrival => {
    if (typeof window === "undefined") return { provider: null, refused: false }
    const remembered = readStored("session", OAUTH_PROVIDER_KEY)
    return {
        provider: remembered === "github" || remembered === "google" ? remembered : null,
        refused: new URLSearchParams(window.location.search).has("error"),
    }
}

/** Read the interrupted path once, preferring the live address over its provider-round-trip copy. */
export const readAuthenticationReturnTo = (search: string, stored: string | null): string | null => {
    const fromAddress = validatedReturnTo(new URLSearchParams(search).get("returnTo"))
    return fromAddress ?? validatedReturnTo(stored)
}

/** Place an authenticated reader at the backend's answer or the validated return intent. */
export const authenticationDestination = (asked: string | null, resolved: string | null): string => {
    const answered = validatedReturnTo(resolved)
    if (asked !== null && answered !== null && answered !== asked) return UNAVAILABLE_RETURN_LANDING
    return answered ?? asked ?? DEFAULT_AUTHENTICATED_LANDING
}
