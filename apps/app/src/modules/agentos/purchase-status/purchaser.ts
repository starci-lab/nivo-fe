import { isRecord } from "@/modules/api/wire"

/** The owner-identity claims the signed-in session's access token may carry. */
export type PurchaserClaims = {
    readonly name?: unknown
    readonly preferred_username?: unknown
    readonly email?: unknown
}

/** Decode the verified identity claims from the signed-in session's access token. */
export const purchaserClaimsOf = (accessToken: string): PurchaserClaims => {
    const payload = accessToken.split(".")[1]
    if (payload === undefined) return {}
    try {
        const normalised = payload.replaceAll("-", "+").replaceAll("_", "/")
        const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, "=")
        const claims: unknown = JSON.parse(globalThis.atob(padded))
        return isRecord(claims) ? claims : {}
    } catch {
        return {}
    }
}

/** Accept a nonempty claim without changing its displayed value. */
export const claimText = (value: unknown): string | null =>
    typeof value === "string" && value.trim().length > 0 ? value : null

/** Display name, then login handle, then contact. */
export const purchaserNameOf = (claims: PurchaserClaims): string | null =>
    claimText(claims.name) ?? claimText(claims.preferred_username) ?? claimText(claims.email)

/** The secondary identity paired beside the name, never repeating the name itself. */
export const purchaserDetailOf = (claims: PurchaserClaims, name: string | null): string | null => {
    const detail = claimText(claims.email) ?? claimText(claims.preferred_username)
    return detail !== null && detail !== name ? detail : null
}
