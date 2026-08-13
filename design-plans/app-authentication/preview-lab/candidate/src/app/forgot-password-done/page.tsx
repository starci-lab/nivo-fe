import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * Sends the reader to sign in, not the console: the mutation returned a boolean.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const ForgotPasswordDoneRoute = () => <AuthenticationPage mode="forgotPassword" phase="done" />

export default ForgotPasswordDoneRoute
