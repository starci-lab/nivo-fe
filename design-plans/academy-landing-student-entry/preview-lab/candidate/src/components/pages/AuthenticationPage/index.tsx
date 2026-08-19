"use client"

import { useRouter } from "@/i18n/navigation"
import { AuthenticationPageBase } from "./component"

/**
 * Resolve authentication-route navigation and draw its pure page twin.
 *
 * PORTED from starci-academy-fe, with one difference the owner settled: a
 * member who signs in lands on the academy dashboard rather than the platform
 * one. No such route exists in this candidate yet, so this proves the redirect
 * HAPPENS and asserts nothing about what it lands on.
 *
 * `replace`, not `push`: the entry screen is not somewhere a signed-in reader
 * should be able to reach with the back button.
 */
export const AuthenticationPage = () => {
    const router = useRouter()
    return <AuthenticationPageBase on={{ signedIn: () => router.replace("/dashboard") }} />
}

/** Source-level tier marker for the connected authentication page. */
export const meta = { world: "connected", domain: "auth" } as const
