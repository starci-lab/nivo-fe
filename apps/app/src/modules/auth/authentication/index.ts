import type { AuthConclusionReason, ContinueBrokeredSignInPayload, ExchangeOauthCodePayload } from "@/modules/api/auth"
import { DEFAULT_AUTHENTICATED_LANDING } from "@/modules/auth"

/** The visible stage of the authentication journey. */
export type AuthPhase = "details" | "code" | "done" | "twoFactor" | "notice"

/** A settled ending that leaves no session or further field to complete. */
export type AuthNoticeKind = "heldAddress" | "createdNoSession" | "sessionEndingApplied" | "sessionEndingUnconfirmed"

/** Answers from either step of a brokered sign-in. */
export type BrokeredAnswer = ExchangeOauthCodePayload | ContinueBrokeredSignInPayload

/** A session-ending value read from the live address. */
export type SessionEndingArrival = {
    readonly handedOff: boolean
    readonly kind: "applied" | "unconfirmed" | null
    readonly rest: string
}

/** Parse a session-ending query and return the remaining query string. */
export const readSessionEndingArrival = (search: string): SessionEndingArrival => {
    const query = new URLSearchParams(search)
    const raw = query.get("sessionEnding")
    query.delete("sessionEnding")
    return {
        handedOff: raw !== null,
        kind: raw === "applied" || raw === "unconfirmed" ? raw : null,
        rest: query.toString(),
    }
}

/** Map the recognised address report to its notice. */
export const sessionEndingNotice = (arrival: SessionEndingArrival | null): AuthNoticeKind | null => {
    if (!arrival?.handedOff || arrival.kind === null) return null
    return arrival.kind === "applied" ? "sessionEndingApplied" : "sessionEndingUnconfirmed"
}

/** The destination carrying the reasonless unavailable-return notice. */
export const UNAVAILABLE_RETURN_LANDING = `${DEFAULT_AUTHENTICATED_LANDING}?returnNotice=unavailable`

/** Storage key for the route interrupted by authentication. */
export const RETURN_TO_STORAGE_KEY = "nivo.auth.return-to"

/** The only brokered answer that can carry a continuation reference. */
export const continuationReference = (answer: BrokeredAnswer): string | null => {
    if (answer.undecided === null || !("continuationReference" in answer.undecided)) return null
    return answer.undecided.continuationReference
}

/** Reasons that finish registration without issuing a session. */
export const noticeForConclusion = (reason: AuthConclusionReason): "heldAddress" | "createdNoSession" | null => {
    if (reason === "heldAddress") return "heldAddress"
    if (reason === "registeredSignInRequired") return "createdNoSession"
    return null
}
