import { Button, Form, Input, Text, TextAction } from "@starci/grammar/common"
import type { FormEvent } from "react"
import type { AuthCodeCopy } from "@/modules/auth/authentication-panel/copy"
import type { AuthenticationPanelProps } from "@/modules/auth/authentication-panel/actions"
import type { AuthFieldErrors, AuthPanelFormState } from "@/modules/auth/authentication-panel/types"
import { OtpField } from "../OtpField"
import { AUTH_PANEL_CLASS_NAME, AUTH_PANEL_FORM_CLASS_NAME, AUTH_PANEL_TEXT_ACTIONS_CLASS_NAME } from "./classNames"

type AuthenticationPanelCodeProps = Extract<AuthenticationPanelProps, { state: "code" }> & {
    readonly formState: AuthPanelFormState
}

const CODE_ID = "authentication-code"
const CODE_STATUS_ID = "authentication-code-status"
const NEW_PASSWORD_ID = "authentication-new-password"
const CONFIRM_NEW_PASSWORD_ID = "authentication-confirm-new-password"
const MINIMUM_PASSWORD_LENGTH = 8

/** Draw and validate the mailed-code step. */
export const AuthenticationPanelCode = (props: AuthenticationPanelCodeProps) => {
    const copy: AuthCodeCopy = props.props
    const { values, fieldErrors, setFieldErrors, clearFieldError } = props.formState
    const setsPassword = copy.mode === "forgotPassword"
    const status =
        copy.statusMessage === "" ? undefined : (
            <Text key="status" size="sm" tone="muted" live={copy.isError ? "assertive" : "polite"}>
                {copy.statusMessage}
            </Text>
        )

    const submitCode = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const nextErrors: AuthFieldErrors = {}
        if (values.current.otp.trim() === "") nextErrors.otp = copy.codeRequired
        else if (!/^\d{6}$/.test(values.current.otp.trim())) nextErrors.otp = copy.codeInvalid
        if (setsPassword && values.current.newPassword === "") nextErrors.newPassword = copy.newPasswordRequired
        else if (setsPassword && values.current.newPassword.length < MINIMUM_PASSWORD_LENGTH)
            nextErrors.newPassword = copy.newPasswordTooShort
        if (setsPassword && values.current.confirmNewPassword === "")
            nextErrors.confirmNewPassword = copy.confirmNewPasswordRequired
        else if (setsPassword && values.current.newPassword !== values.current.confirmNewPassword)
            nextErrors.confirmNewPassword = copy.confirmNewPasswordMismatch
        setFieldErrors(nextErrors)
        if (Object.keys(nextErrors).length > 0) return
        props.on?.submitCode?.({ otp: values.current.otp.trim(), newPassword: values.current.newPassword })
    }

    const isCoolingDown = copy.cooldownLabel !== ""
    return (
        <div className={AUTH_PANEL_CLASS_NAME}>
            <Form onSubmit={(_, event) => submitCode(event)}>
                <div className={AUTH_PANEL_FORM_CLASS_NAME}>
                    {[
                        <OtpField
                            key="code"
                            id={CODE_ID}
                            label={copy.codeLabel}
                            statusId={CODE_STATUS_ID}
                            message={
                                fieldErrors.otp ??
                                (copy.isError && copy.statusMessage !== "" ? copy.statusMessage : copy.codeHint)
                            }
                            isError={fieldErrors.otp !== undefined || copy.isError}
                            isPending={copy.isPending}
                            onValue={(value) => {
                                props.formState.setFieldValue("otp", value)
                                clearFieldError("otp")
                            }}
                        />,
                        ...(!setsPassword
                            ? []
                            : [
                                  <Input
                                      key="new-password"
                                      id={NEW_PASSWORD_ID}
                                      name="newPassword"
                                      variant="primary"
                                      kind="newPassword"
                                      label={copy.newPasswordLabel}
                                      placeholder={copy.newPasswordPlaceholder}
                                      revealLabel={copy.revealLabel}
                                      hideLabel={copy.hideLabel}
                                      isDisabled={copy.isPending}
                                      hint={
                                          fieldErrors.newPassword !== undefined
                                              ? undefined
                                              : (fieldErrors.newPassword ?? copy.newPasswordHint)
                                      }
                                      errorMessage={
                                          fieldErrors.newPassword !== undefined
                                              ? (fieldErrors.newPassword ?? copy.newPasswordHint)
                                              : undefined
                                      }
                                      isError={fieldErrors.newPassword !== undefined}
                                      onValueChange={(value) => {
                                          props.formState.setFieldValue("newPassword", value)
                                          clearFieldError("newPassword")
                                          clearFieldError("confirmNewPassword")
                                      }}
                                  />,
                                  <Input
                                      key="confirm-new-password"
                                      id={CONFIRM_NEW_PASSWORD_ID}
                                      name="confirmNewPassword"
                                      variant="primary"
                                      kind="newPassword"
                                      label={copy.confirmNewPasswordLabel}
                                      placeholder={copy.confirmNewPasswordPlaceholder}
                                      revealLabel={copy.revealLabel}
                                      hideLabel={copy.hideLabel}
                                      isDisabled={copy.isPending}
                                      hint={
                                          fieldErrors.confirmNewPassword !== undefined
                                              ? undefined
                                              : fieldErrors.confirmNewPassword
                                      }
                                      errorMessage={
                                          fieldErrors.confirmNewPassword !== undefined
                                              ? fieldErrors.confirmNewPassword
                                              : undefined
                                      }
                                      isError={fieldErrors.confirmNewPassword !== undefined}
                                      onValueChange={(value) => {
                                          props.formState.setFieldValue("confirmNewPassword", value)
                                          clearFieldError("confirmNewPassword")
                                      }}
                                  />,
                              ]),
                        ...(status === undefined || copy.isError ? [] : [status]),
                        <div key="resend" className={AUTH_PANEL_TEXT_ACTIONS_CLASS_NAME}>
                            <TextAction
                                size="sm"
                                onPress={isCoolingDown || copy.isPending ? undefined : props.on?.resend}
                            >
                                {isCoolingDown ? copy.cooldownLabel : copy.resendLabel}
                            </TextAction>
                        </div>,
                        <Button
                            key="submit"
                            variant="primary"
                            type="submit"
                            width="fill"
                            isDisabled={copy.isPending}
                            isPending={copy.pendingAction === "submit"}
                        >
                            {copy.submitLabel}
                        </Button>,
                    ]}
                </div>
            </Form>
        </div>
    )
}
