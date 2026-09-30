import type { AuthMode } from "@/components/blocks/auth/AuthenticationPanel"
import type { AuthPhase } from "@/modules/auth/authentication"

/** One translated action offered below the authentication surface. */
export type AuthenticationJourneyExit = {
    readonly question: string
    readonly action: string
    readonly onPress: () => void
}

/** Inputs for the pure journey exits projected below the authentication surface. */
type AuthenticationExitsInput = {
    readonly mode: AuthMode
    readonly phase: AuthPhase
    readonly isRestoring: boolean
    readonly isSignedInArrival: boolean
    readonly translate: (key: string) => string
    readonly clear: () => void
    readonly changeMode: (mode: AuthMode) => void
}

/** Resolve the alternate authentication journeys and exits for the current settled phase. */
export const authenticationExitsFor = (input: AuthenticationExitsInput): ReadonlyArray<AuthenticationJourneyExit> => {
    const { mode, phase, isRestoring, isSignedInArrival, translate, clear, changeMode } = input
    if (isRestoring || isSignedInArrival || phase === "done" || phase === "notice") return []

    const switchTo = mode === "signIn" ? "signUp" : "signIn"
    const prompt = {
        question: translate(`${mode}.promptQuestion`),
        action: translate(`${mode}.promptAction`),
        onPress: () => changeMode(switchTo),
    }
    if (phase === "twoFactor")
        return [{ question: "", action: translate("signIn.backLabel"), onPress: clear }]
    if (phase === "code")
        return [{ question: "", action: translate("backLabel"), onPress: clear }, prompt]
    return [prompt]
}
