import { collabFailure } from "./payload"
import { type Outcome } from "@nivo/api"
const FORBIDDEN_AUTHORITY_CLAIMS = new Set([
    "askerGrantScope",
    "askerGrant",
    "grant",
    "grantScope",
    "role",
    "actorRole",
    "memberId",
    "member",
    "membership",
    "membershipId",
    "membershipClaims",
    "isMember",
    "principal",
    "loginPrincipal",
    "sub",
    "email",
    "verifiedEmail",
    "emailVerified",
    "email_verified",
    "phone",
    "verifiedPhone",
    "actor",
])

/**
 * Refuse a call that smuggles an authority or identity claim the ingress must never
 * read from input, before the request leaves the adapter. The op's own domain fields
 * that happen to share a claim name (`inviteByEmail`'s `email`/`role`,
 * `changeMemberRole`'s `memberId`/`role`) are passed in `allowed` - they name the
 * invitee or target, never the actor.
 */
export const rejectAuthorityClaims = (
    op: string,
    args: Readonly<Record<string, unknown>>,
    allowed: ReadonlyArray<string>,
): Outcome<never> | null => {
    const claim = Object.keys(args).find(
        (key): boolean => FORBIDDEN_AUTHORITY_CLAIMS.has(key) && !allowed.includes(key),
    )
    return claim === undefined
        ? null
        : collabFailure(
              "invalid",
              "COLLAB_INVALID",
              `${op} does not accept ${claim}; the ingress derives actor identity from the verified bearer.`,
              false,
          )
}
