import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * The account exists and a session was opened.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const SignUpDoneRoute = () => <AuthenticationPage mode="signUp" phase="done" />

export default SignUpDoneRoute
