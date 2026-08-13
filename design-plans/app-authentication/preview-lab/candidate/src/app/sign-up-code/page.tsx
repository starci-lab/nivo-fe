import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * The code step. The hint states the lifetime rather than a refusal.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const SignUpCodeRoute = () => <AuthenticationPage mode="signUp" phase="code" />

export default SignUpCodeRoute
