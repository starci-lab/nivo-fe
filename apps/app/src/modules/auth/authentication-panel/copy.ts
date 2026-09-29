import type { AuthMode, AuthPendingAction, AuthProvider } from "./types"

/** Copy and situation shared by every tree here. Already resolved - a block never translates. */
export type AuthFrame = {
    /** What the surface is called while this journey is on screen. The host draws it above the panel. */
    readonly title: string
    /** The line under the title, saying what the reader is here to do. */
    readonly subtitle: string
    /** The one sentence that goes with whatever is happening, or `""` when nothing is. */
    readonly statusMessage: string
    /** Whether that sentence is a refusal, so it is announced rather than merely shown. */
    readonly isError: boolean
    /** A request is already on its way, so every control refuses a second press. */
    readonly isPending: boolean
    /** The exact action that owns the pending indicator. */
    readonly pendingAction?: AuthPendingAction
    /** Provider that owns the wait; absent when its button is no longer available. */
    readonly pendingProvider?: AuthProvider
}

/** Copy for the first step. */
export type AuthDetailsCopy = AuthFrame & {
    readonly mode: AuthMode
    readonly emailLabel: string
    readonly emailPlaceholder: string
    readonly emailRequired: string
    readonly emailInvalid: string
    readonly emailHint: string
    readonly passwordLabel: string
    readonly passwordPlaceholder: string
    readonly passwordRequired: string
    readonly passwordTooShort: string
    readonly passwordHint: string
    readonly confirmPasswordLabel: string
    readonly confirmPasswordPlaceholder: string
    readonly confirmPasswordRequired: string
    readonly confirmPasswordMismatch: string
    readonly nameLabel: string
    readonly namePlaceholder: string
    readonly nameHint: string
    readonly nameTooLong: string
    readonly authorityHint: string
    readonly revealLabel: string
    readonly hideLabel: string
    readonly submitLabel: string
    readonly orLabel: string
    readonly googleLabel: string
    readonly githubLabel: string
    readonly forgotPasswordLabel: string
    readonly rememberMeLabel: string
    readonly isRememberMe: boolean
}

/** Copy for the mailed-code step. */
export type AuthCodeCopy = AuthFrame & {
    readonly mode: AuthMode
    readonly codeLabel: string
    readonly codeRequired: string
    readonly codeInvalid: string
    readonly codeHint: string
    readonly newPasswordLabel: string
    readonly newPasswordPlaceholder: string
    readonly newPasswordRequired: string
    readonly newPasswordTooShort: string
    readonly newPasswordHint: string
    readonly confirmNewPasswordLabel: string
    readonly confirmNewPasswordPlaceholder: string
    readonly confirmNewPasswordRequired: string
    readonly confirmNewPasswordMismatch: string
    readonly revealLabel: string
    readonly hideLabel: string
    readonly submitLabel: string
    readonly resendLabel: string
    /** `""` means the cooldown has passed and `resendLabel` is shown instead. */
    readonly cooldownLabel: string
    /** The way back to the first step. Drawn by the host page, below the surface. */
    readonly backLabel: string
}

/** Copy for the second-factor step: the same six slots, nothing mailed, no resend. */
export type AuthFactorCopy = AuthFrame & {
    readonly codeLabel: string
    readonly codeRequired: string
    readonly codeInvalid: string
    readonly submitLabel: string
    /** The way back to the first step. Drawn by the host page, below the surface. */
    readonly backLabel: string
}

/** Copy for the restoring tree: no form, only a wait with a name. */
export type AuthRestoringCopy = {
    readonly title: string
    readonly subtitle: string
    readonly progressLabel: string
}

/** Copy for a settled tree that offers up to two ways onward. */
export type AuthNoticeCopy = AuthFrame & {
    readonly doneTitle: string
    readonly doneHint: string
    readonly onwardLabel: string
    readonly secondaryLabel: string
}
