import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * The account owes a second factor this build cannot complete - neither a refusal nor a session.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const SignInTwoFactorRoute = () => <AuthenticationPage mode="signIn" phase="twoFactor" />

export default SignInTwoFactorRoute
