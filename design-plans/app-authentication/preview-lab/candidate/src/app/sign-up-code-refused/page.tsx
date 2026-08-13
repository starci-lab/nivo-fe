import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * A wrong code. The challenge survives, so the reader retypes.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const SignUpCodeRefusedRoute = () => <AuthenticationPage mode="signUp" phase="codeRefused" />

export default SignUpCodeRefusedRoute
