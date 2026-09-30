import { Button, Form } from "@starci/grammar/common"
import type { FormEvent } from "react"
import type { AuthFactorCopy } from "@/modules/auth/authentication-panel/copy"
import type { AuthenticationPanelProps } from "@/modules/auth/authentication-panel/actions"
import type { AuthFieldErrors, AuthPanelFormState } from "@/modules/auth/authentication-panel/types"
import { OtpField } from "../OtpField"
import { AUTH_PANEL_CLASS_NAME, AUTH_PANEL_FORM_CLASS_NAME } from "./classNames"

type AuthenticationPanelFactorProps = Extract<AuthenticationPanelProps, { state: "secondFactor" }> & {
    readonly formState: AuthPanelFormState
}

const CODE_ID = "authentication-code"
const CODE_STATUS_ID = "authentication-code-status"

/** Draw and validate the second-factor step. */
export const AuthenticationPanelFactor = (props: AuthenticationPanelFactorProps) => {
    const copy: AuthFactorCopy = props.props
    const { values, fieldErrors, setFieldErrors, clearFieldError } = props.formState
    const submitFactor = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const nextErrors: AuthFieldErrors = {}
        if (values.current.otp.trim() === "") nextErrors.otp = copy.codeRequired
        else if (!/^\d{6}$/.test(values.current.otp.trim())) nextErrors.otp = copy.codeInvalid
        setFieldErrors(nextErrors)
        if (Object.keys(nextErrors).length > 0) return
        props.on?.submitFactor?.({ code: values.current.otp.trim() })
    }

    return (
        <div className={AUTH_PANEL_CLASS_NAME}>
            <Form onSubmit={(_, event) => submitFactor(event)}>
                <div className={AUTH_PANEL_FORM_CLASS_NAME}>
                    <OtpField
                        id={CODE_ID}
                        label={copy.codeLabel}
                        statusId={CODE_STATUS_ID}
                        message={fieldErrors.otp ?? (copy.statusMessage === "" ? "" : copy.statusMessage)}
                        isError={fieldErrors.otp !== undefined || copy.isError}
                        isPending={copy.isPending}
                        onValue={(value) => {
                            props.formState.setFieldValue("otp", value)
                            clearFieldError("otp")
                        }}
                    />
                    <Button
                        variant="primary"
                        type="submit"
                        width="fill"
                        isDisabled={copy.isPending}
                        isPending={copy.pendingAction === "submit"}
                    >
                        {copy.submitLabel}
                    </Button>
                </div>
            </Form>
        </div>
    )
}
