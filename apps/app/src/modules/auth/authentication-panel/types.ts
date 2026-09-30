import type { Dispatch, SetStateAction } from "react"

/** Which journey the reader is on. */
export type AuthMode = "signIn" | "signUp" | "forgotPassword"

/** Which provider the reader chose. */
export type AuthProvider = "google" | "github"

/** Which tree is drawn; each state owns a different form or ending. */
export type AuthState =
    | "details"
    | "code"
    | "secondFactor"
    | "done"
    | "restoring"
    | "twoFactorUnsupported"
    | "notice"

/** The exact control whose action is currently running. */
export type AuthPendingAction = "provider" | "submit" | "resend"

/** What the reader hands over at the first step. */
export type AuthDetails = {
    readonly email: string
    readonly password: string
    readonly name: string
}

/** What the reader hands over at the mailed-code step. */
export type AuthCode = {
    readonly otp: string
    readonly newPassword: string
}

/** What the reader hands over at the second-factor step. */
export type AuthFactor = {
    readonly code: string
}

/** Field ids, so every label reaches the box it names. */
export type AuthFieldName =
    | "email"
    | "password"
    | "confirmPassword"
    | "name"
    | "otp"
    | "newPassword"
    | "confirmNewPassword"

/** Validation messages keyed by the field that owns each message. */
export type AuthFieldErrors = Partial<Record<AuthFieldName, string>>

/** What the form starts with. */
export const EMPTY = {
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
}

/** Mutable input values stored outside the uncontrolled controls. */
type AuthFormValues = typeof EMPTY

/** Shared uncontrolled form state, kept by the dispatcher across state changes. */
export type AuthPanelFormState = {
    readonly values: { current: AuthFormValues }
    readonly fieldErrors: AuthFieldErrors
    readonly setFieldErrors: Dispatch<SetStateAction<AuthFieldErrors>>
    readonly clearFieldError: (field: AuthFieldName) => void
    readonly setFieldValue: (field: AuthFieldName, value: string) => void
}
