import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * The same surface, one mode over: a third box appears and the password gains its rule.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const SignUpRoute = () => <AuthenticationPage mode="signUp" phase="details" />

export default SignUpRoute
