import { AuthenticationPage } from "@/components/pages/AuthenticationPage"

/**
 * The `/authentication` route. It mounts one page and makes no drawing decision - LAYOUT-6.
 *
 * ONE ADDRESS FOR ALL THREE JOURNEYS, matching the named reference. Signing in, opening an account
 * and resetting a password are modes of one surface rather than three routes, so the mode lives in
 * panel state and this file names nothing about it.
 *
 * @returns The route.
 */
const AuthenticationRoute = () => <AuthenticationPage />

export default AuthenticationRoute