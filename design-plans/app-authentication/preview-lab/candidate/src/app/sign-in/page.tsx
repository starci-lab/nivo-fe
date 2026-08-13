import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * The route as a reader first meets it: one shortcut, the divider, two boxes, and the way to sign up as a question and its answer.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const SignInRoute = () => <AuthenticationPage mode="signIn" phase="details" />

export default SignInRoute
