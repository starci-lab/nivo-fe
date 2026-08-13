import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * Refused before any code was sent.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const SignUpRefusedRoute = () => <AuthenticationPage mode="signUp" phase="detailsRefused" />

export default SignUpRefusedRoute
