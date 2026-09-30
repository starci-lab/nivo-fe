import { Checkbox, IconSource } from "@nivo/ui"
import { Button, Divider, Form, Icon, Text, TextAction } from "@starci/grammar/common"
import type { AuthenticationPanelDetailsBaseProps } from "./authentication-details.types"
import { AuthenticationCredentialFields } from "./AuthenticationCredentialFields"
import {
    AUTH_PANEL_CLASS_NAME,
    AUTH_PANEL_DETAILS_CLASS_NAME,
    AUTH_PANEL_FORM_CLASS_NAME,
    AUTH_PANEL_OPTIONS_CLASS_NAME,
    AUTH_PANEL_PROVIDER_CLASS_NAME,
} from "./classNames"

const PROVIDERS = [
    { provider: "google", icon: "google" },
    { provider: "github", icon: "github" },
] as const

/** Draw the first authentication step from resolved copy, errors, and actions. */
export const AuthenticationPanelDetailsBase = (props: AuthenticationPanelDetailsBaseProps) => {
    const { copy } = props.props
    const status =
        copy.statusMessage === "" ? undefined : (
            <Text key="status" size="sm" tone="muted" live={props.props.announcement}>
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
                          on={{ change: (isRemembered) => props.on.changeRememberMe?.(isRemembered) }}
                      />
                      <TextAction size="sm" onPress={() => props.on.changeMode?.("forgotPassword")}>
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
                              onPress={() => props.on.chooseProvider?.(entry.provider)}
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
                <Form
                    label={copy.title}
                    validationBehavior="aria"
                    isPending={copy.isPending}
                    onSubmit={() => props.on.submit()}
                >
                    <div className={AUTH_PANEL_FORM_CLASS_NAME}>
                        <AuthenticationCredentialFields {...props} />
                        {credentialActions}
                    </div>
                </Form>
            </div>
        </div>
    )
}
