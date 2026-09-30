import type { AuthDetailsCopy } from "@/modules/auth/authentication-panel/copy"
import type { AuthenticationPanelProps } from "@/modules/auth/authentication-panel/actions"
import type { AuthFieldErrors, AuthPanelFormState } from "@/modules/auth/authentication-panel/types"
import { AuthenticationPanelDetailsBase } from "./component"

type AuthenticationPanelDetailsProps = Extract<AuthenticationPanelProps, { state: "details" }> & {
    readonly formState: AuthPanelFormState
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MINIMUM_PASSWORD_LENGTH = 8
const MAXIMUM_NAME_LENGTH = 120

/** Validate the first authentication step and connect its form state to the drawing half. */
export const AuthenticationPanelDetails = (props: AuthenticationPanelDetailsProps) => {
    const copy: AuthDetailsCopy = props.props
    const { values, fieldErrors, setFieldErrors, clearFieldError } = props.formState
    const isSignUp = copy.mode === "signUp"
    const isReset = copy.mode === "forgotPassword"

    const submitDetails = () => {
        const nextErrors: AuthFieldErrors = {}
        const email = values.current.email.trim()
        const name = values.current.name.trim()
        if (email === "") nextErrors.email = copy.emailRequired
        else if (!EMAIL_PATTERN.test(email)) nextErrors.email = copy.emailInvalid
        if (!isReset && values.current.password === "") nextErrors.password = copy.passwordRequired
        else if (!isReset && values.current.password.length < MINIMUM_PASSWORD_LENGTH)
            nextErrors.password = copy.passwordTooShort
        if (isSignUp && values.current.confirmPassword === "") nextErrors.confirmPassword = copy.confirmPasswordRequired
        else if (isSignUp && values.current.password !== values.current.confirmPassword)
            nextErrors.confirmPassword = copy.confirmPasswordMismatch
        if (isSignUp && name.length > MAXIMUM_NAME_LENGTH) nextErrors.name = copy.nameTooLong
        setFieldErrors(nextErrors)
        if (Object.keys(nextErrors).length > 0) return
        props.on?.submitDetails?.({ email, password: values.current.password, name })
    }

    return (
        <AuthenticationPanelDetailsBase
            props={{ copy, fieldErrors, announcement: copy.isError ? "assertive" : "polite" }}
            on={{
                submit: submitDetails,
                changeField: (field, value) => {
                    props.formState.setFieldValue(field, value)
                    clearFieldError(field)
                    if (field === "password") clearFieldError("confirmPassword")
                },
                changeRememberMe: props.on?.changeRememberMe,
                changeMode: props.on?.changeMode,
                chooseProvider: props.on?.chooseProvider,
            }}
        />
    )
}
