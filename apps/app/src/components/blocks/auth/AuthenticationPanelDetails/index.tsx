import { Checkbox, IconSource } from "@nivo/ui"
import { Button, Divider, Icon, Input, Text, TextAction } from "@starci/grammar/common"
import type { SubmitEvent } from "react"
import type { AuthDetailsCopy } from "@/modules/auth/authentication-panel/copy"
import type { AuthenticationPanelProps } from "@/modules/auth/authentication-panel/actions"
import type { AuthFieldErrors, AuthPanelFormState } from "@/modules/auth/authentication-panel/types"
import {
    AUTH_PANEL_CLASS_NAME,
    AUTH_PANEL_DETAILS_CLASS_NAME,
    AUTH_PANEL_FORM_CLASS_NAME,
    AUTH_PANEL_OPTIONS_CLASS_NAME,
    AUTH_PANEL_PROVIDER_CLASS_NAME,
} from "./classNames"

type AuthenticationPanelDetailsProps = Extract<AuthenticationPanelProps, { state: "details" }> & {
    readonly formState: AuthPanelFormState
}

const EMAIL_ID = "authentication-email"
const PASSWORD_ID = "authentication-password"
const CONFIRM_ID = "authentication-confirm-password"
const NAME_ID = "authentication-name"
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MINIMUM_PASSWORD_LENGTH = 8
const MAXIMUM_NAME_LENGTH = 120
const PROVIDERS = [
    { provider: "google", icon: "google" },
    { provider: "github", icon: "github" },
] as const

/** Draw and validate the first authentication step. */
export const AuthenticationPanelDetails = (props: AuthenticationPanelDetailsProps) => {
    const copy: AuthDetailsCopy = props.props
    const { values, fieldErrors, setFieldErrors, clearFieldError } = props.formState
    const isSignUp = copy.mode === "signUp"
    const isReset = copy.mode === "forgotPassword"

    const submitDetails = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()
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

    const credentialFields = [
        ...(!isSignUp
            ? []
            : [
                  <Input
                      key="name"
                      id={NAME_ID}
                      name="name"
                      variant="primary"
                      kind="text"
                      label={copy.nameLabel}
                      placeholder={copy.namePlaceholder}
                      isDisabled={copy.isPending}
                      hint={fieldErrors.name !== undefined ? undefined : (fieldErrors.name ?? copy.nameHint)}
                      errorMessage={fieldErrors.name !== undefined ? (fieldErrors.name ?? copy.nameHint) : undefined}
                      isError={fieldErrors.name !== undefined}
                      onValueChange={(value) => {
                          props.formState.setFieldValue("name", value)
                          clearFieldError("name")
                      }}
                  />,
              ]),
        <Input
            key="email"
            id={EMAIL_ID}
            name="email"
            variant="primary"
            kind="email"
            label={copy.emailLabel}
            placeholder={copy.emailPlaceholder}
            isDisabled={copy.isPending}
            hint={fieldErrors.email !== undefined ? undefined : (fieldErrors.email ?? (isReset ? copy.emailHint : undefined))}
            errorMessage={
                fieldErrors.email !== undefined ? (fieldErrors.email ?? (isReset ? copy.emailHint : undefined)) : undefined
            }
            isError={fieldErrors.email !== undefined}
            onValueChange={(value) => {
                props.formState.setFieldValue("email", value)
                clearFieldError("email")
            }}
        />,
        ...(isReset
            ? []
            : [
                  <Input
                      key="password"
                      id={PASSWORD_ID}
                      name="password"
                      variant="primary"
                      kind={isSignUp ? "newPassword" : "password"}
                      label={copy.passwordLabel}
                      placeholder={copy.passwordPlaceholder}
                      revealLabel={copy.revealLabel}
                      hideLabel={copy.hideLabel}
                      isDisabled={copy.isPending}
                      hint={
                          fieldErrors.password !== undefined
                              ? undefined
                              : (fieldErrors.password ?? (isSignUp ? copy.passwordHint : undefined))
                      }
                      errorMessage={
                          fieldErrors.password !== undefined
                              ? (fieldErrors.password ?? (isSignUp ? copy.passwordHint : undefined))
                              : undefined
                      }
                      isError={fieldErrors.password !== undefined}
                      onValueChange={(value) => {
                          props.formState.setFieldValue("password", value)
                          clearFieldError("password")
                          clearFieldError("confirmPassword")
                      }}
                  />,
              ]),
        ...(!isSignUp
            ? []
            : [
                  <Input
                      key="confirm-password"
                      id={CONFIRM_ID}
                      name="confirmPassword"
                      variant="primary"
                      kind="newPassword"
                      label={copy.confirmPasswordLabel}
                      placeholder={copy.confirmPasswordPlaceholder}
                      revealLabel={copy.revealLabel}
                      hideLabel={copy.hideLabel}
                      isDisabled={copy.isPending}
                      hint={fieldErrors.confirmPassword !== undefined ? undefined : fieldErrors.confirmPassword}
                      errorMessage={fieldErrors.confirmPassword !== undefined ? fieldErrors.confirmPassword : undefined}
                      isError={fieldErrors.confirmPassword !== undefined}
                      onValueChange={(value) => {
                          props.formState.setFieldValue("confirmPassword", value)
                          clearFieldError("confirmPassword")
                      }}
                  />,
                  <Text key="authority-hint" size="sm" tone="muted">
                      {copy.authorityHint}
                  </Text>,
              ]),
    ]

    const status =
        copy.statusMessage === "" ? undefined : (
            <Text key="status" size="sm" tone="muted" live={copy.isError ? "assertive" : "polite"}>
                {copy.statusMessage}
            </Text>
        )
    const credentialActions = [
        ...(copy.mode !== "signIn"
            ? []
            : [
                  <div key="options" className={AUTH_PANEL_OPTIONS_CLASS_NAME}>
                      <Checkbox
                          props={{ label: copy.rememberMeLabel, isSelected: copy.isRememberMe, name: "rememberMe" }}
                          on={{ change: (isRemembered) => props.on?.changeRememberMe?.(isRemembered) }}
                      />
                      <TextAction size="sm" onPress={() => props.on?.changeMode?.("forgotPassword")}>
                          {copy.forgotPasswordLabel}
                      </TextAction>
                  </div>,
              ]),
        ...(status === undefined ? [] : [status]),
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
    ]
    const providerRow =
        copy.mode !== "signIn"
            ? []
            : [
                  <div key="providers" className={AUTH_PANEL_PROVIDER_CLASS_NAME}>
                      {PROVIDERS.map((entry) => (
                          <Button
                              key={entry.provider}
                              variant="outline"
                              width="fill"
                              isDisabled={copy.isPending}
                              isPending={copy.pendingAction === "provider" && copy.pendingProvider === entry.provider}
                              onPress={() => props.on?.chooseProvider?.(entry.provider)}
                              startContent={<Icon source={IconSource(entry.icon, "chip")} usage="chip" />}
                          >
                              {entry.provider === "google" ? copy.googleLabel : copy.githubLabel}
                          </Button>
                      ))}
                      <Divider label={copy.orLabel} />
                  </div>,
              ]

    return (
        <div className={AUTH_PANEL_CLASS_NAME}>
            <div className={AUTH_PANEL_DETAILS_CLASS_NAME}>
                {providerRow}
                <form onSubmit={submitDetails}>
                    <div className={AUTH_PANEL_FORM_CLASS_NAME}>
                        {credentialFields}
                        {credentialActions}
                    </div>
                </form>
            </div>
        </div>
    )
}
