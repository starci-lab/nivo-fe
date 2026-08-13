import { AuthenticationPage } from "../../components/pages/AuthenticationPage"

/**
 * Sixty real seconds, said out loud instead of a control that looks pressable and is not.
 *
 * TARGET: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx` - ONE route for all of these.
 * The candidate gives each state its own URL only so a static export can seal it.
 *
 * @returns The route.
 */
const SignUpCodeCooldownRoute = () => <AuthenticationPage mode="signUp" phase="codeCooldown" />

export default SignUpCodeCooldownRoute
