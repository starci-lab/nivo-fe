import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * Credentials refused. The sentence never says whether the address exists.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const SignInRefusedRoute = () => <AuthenticationPage mode="signIn" phase="detailsRefused" />

export default SignInRefusedRoute
