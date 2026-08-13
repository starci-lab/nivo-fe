import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * One sentence for both failures, so an inbox holder cannot tell a wrong code from an address nobody has.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const ForgotPasswordCodeRefusedRoute = () => <AuthenticationPage mode="forgotPassword" phase="codeRefused" />

export default ForgotPasswordCodeRefusedRoute
