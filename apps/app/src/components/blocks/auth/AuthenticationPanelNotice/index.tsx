import { Button, Heading, Text, TextAction } from "@starci/grammar/common"
import type { AuthNoticeCopy } from "@/modules/auth/authentication-panel/copy"
import type { AuthenticationPanelProps } from "@/modules/auth/authentication-panel/actions"
import { AUTH_PANEL_CLASS_NAME, AUTH_PANEL_NOTICE_ACTIONS_CLASS_NAME, AUTH_PANEL_NOTICE_CLASS_NAME } from "./classNames"

type AuthenticationPanelNoticeProps = Extract<
    AuthenticationPanelProps,
    { state: "done" | "twoFactorUnsupported" | "notice" }
>

/** Draw a settled notice and its available ways onward. */
export const AuthenticationPanelNotice = (props: AuthenticationPanelNoticeProps) => {
    const copy: AuthNoticeCopy = props.props
    return (
        <div className={AUTH_PANEL_CLASS_NAME}>
            <div className={AUTH_PANEL_NOTICE_CLASS_NAME}>
                {copy.doneTitle === ""
                    ? []
                    : [
                          <Heading key="notice-title" level={2}>
                              {copy.doneTitle}
                          </Heading>,
                      ]}
                <Text size="sm" tone="muted">
                    {copy.doneHint}
                </Text>
            </div>
            <div className={AUTH_PANEL_NOTICE_ACTIONS_CLASS_NAME}>
                <>
                    {copy.statusMessage === ""
                        ? []
                        : [
                              <Text
                                  key="status"
                                  size="sm"
                                  tone={copy.isError ? "accent" : "muted"}
                                  live={copy.isError ? "assertive" : "polite"}
                              >
                                  {copy.statusMessage}
                              </Text>,
                          ]}
                    <Button variant="primary" width="fill" onPress={props.on?.onward}>
                        {copy.onwardLabel}
                    </Button>
                    {copy.secondaryLabel === ""
                        ? []
                        : [
                              <TextAction key="secondary" onPress={props.on?.onwardSecondary}>
                                  {copy.secondaryLabel}
                              </TextAction>,
                          ]}
                </>
            </div>
        </div>
    )
}
