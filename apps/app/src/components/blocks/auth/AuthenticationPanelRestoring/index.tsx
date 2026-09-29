import { Progress, Text } from "@starci/grammar/common"
import type { AuthRestoringCopy } from "@/modules/auth/authentication-panel/copy"
import type { AuthenticationPanelProps } from "@/modules/auth/authentication-panel/actions"
import { AUTH_PANEL_CLASS_NAME, AUTH_PANEL_NOTICE_CLASS_NAME } from "./classNames"

type AuthenticationPanelRestoringProps = Extract<AuthenticationPanelProps, { state: "restoring" }>

/** Draw the restoring wait. */
export const AuthenticationPanelRestoring = (props: AuthenticationPanelRestoringProps) => {
    const copy: AuthRestoringCopy = props.props
    return (
        <div className={AUTH_PANEL_CLASS_NAME}>
            <div className={AUTH_PANEL_NOTICE_CLASS_NAME}>
                <Progress label={copy.progressLabel} isSkeleton />
                <Text size="sm" tone="muted" live="polite">
                    {copy.progressLabel}
                </Text>
            </div>
        </div>
    )
}
