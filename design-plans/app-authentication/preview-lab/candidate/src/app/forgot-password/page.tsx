import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * One field and no password: the reset journey proves the inbox first.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const ForgotPasswordRoute = () => <AuthenticationPage mode="forgotPassword" phase="details" />

export default ForgotPasswordRoute
