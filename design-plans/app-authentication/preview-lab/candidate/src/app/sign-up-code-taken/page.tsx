import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * The address already has an account - and this arrives AFTER the code is spent.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const SignUpCodeTakenRoute = () => <AuthenticationPage mode="signUp" phase="codeTaken" />

export default SignUpCodeTakenRoute
