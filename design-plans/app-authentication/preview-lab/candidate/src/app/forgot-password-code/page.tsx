import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * The code and the new password together, because the mutation takes both in one request.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const ForgotPasswordCodeRoute = () => <AuthenticationPage mode="forgotPassword" phase="code" />

export default ForgotPasswordCodeRoute
