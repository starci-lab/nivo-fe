import type { AuthCodeCopy, AuthDetailsCopy, AuthFactorCopy, AuthNoticeCopy, AuthRestoringCopy } from "./copy"
import type { AuthCode, AuthDetails, AuthFactor, AuthMode, AuthProvider, AuthState } from "./types"

/** What the panel can do. */
export type AuthActions = {
    readonly chooseProvider?: (provider: AuthProvider) => void
    readonly submitDetails?: (details: AuthDetails) => void
    readonly submitCode?: (code: AuthCode) => void
    readonly submitFactor?: (factor: AuthFactor) => void
    readonly resend?: () => void
    readonly back?: () => void
    readonly changeMode?: (mode: AuthMode) => void
    readonly changeRememberMe?: (isRemembered: boolean) => void
    readonly onward?: () => void
    readonly onwardSecondary?: () => void
}

/** Props for AuthenticationPanel, discriminated by the state being drawn. */
type StateBlockProps<State extends AuthState, Data> = {
    readonly state: State
    readonly props: Data
}

/** Public AuthenticationPanelProps declaration. */
export type AuthenticationPanelProps =
    | (StateBlockProps<"details", AuthDetailsCopy> & { readonly on?: AuthActions })
    | (StateBlockProps<"code", AuthCodeCopy> & { readonly on?: AuthActions })
    | (StateBlockProps<"secondFactor", AuthFactorCopy> & { readonly on?: AuthActions })
    | (StateBlockProps<"done", AuthNoticeCopy> & { readonly on?: AuthActions })
    | (StateBlockProps<"restoring", AuthRestoringCopy> & { readonly on?: AuthActions })
    | (StateBlockProps<"twoFactorUnsupported", AuthNoticeCopy> & { readonly on?: AuthActions })
    | (StateBlockProps<"notice", AuthNoticeCopy> & { readonly on?: AuthActions })
