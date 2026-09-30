import { Input, Text } from "@starci/grammar/common"
import type { AuthenticationPanelDetailsBaseProps } from "./authentication-details.types"

type AuthenticationCredentialFieldsProps = AuthenticationPanelDetailsBaseProps

const EMAIL_ID = "authentication-email"
const PASSWORD_ID = "authentication-password"
const CONFIRM_ID = "authentication-confirm-password"
const NAME_ID = "authentication-name"

/** Draw name, email, and password controls for the selected authentication journey. */
export const AuthenticationCredentialFields = (props: AuthenticationCredentialFieldsProps) => {
    const { copy, fieldErrors } = props.props
    const isSignUp = copy.mode === "signUp"
    const isReset = copy.mode === "forgotPassword"
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
                          props.on.changeField("name", value)
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
            hint={
                fieldErrors.email !== undefined
                    ? undefined
                    : (fieldErrors.email ?? (isReset ? copy.emailHint : undefined))
            }
            errorMessage={
                fieldErrors.email !== undefined
                    ? (fieldErrors.email ?? (isReset ? copy.emailHint : undefined))
                    : undefined
            }
            isError={fieldErrors.email !== undefined}
            onValueChange={(value) => {
                props.on.changeField("email", value)
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
                          props.on.changeField("password", value)
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
                          props.on.changeField("confirmPassword", value)
                      }}
                  />,
                  <Text key="authority-hint" size="sm" tone="muted">
                      {copy.authorityHint}
                  </Text>,
              ]),
    ]

    return <>{credentialFields}</>
}
