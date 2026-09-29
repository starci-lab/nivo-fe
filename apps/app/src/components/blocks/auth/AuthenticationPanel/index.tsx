import { useRef, useState } from "react"
import { AuthenticationPanelCode } from "../AuthenticationPanelCode"
import { AuthenticationPanelDetails } from "../AuthenticationPanelDetails"
import { AuthenticationPanelFactor } from "../AuthenticationPanelFactor"
import { AuthenticationPanelNotice } from "../AuthenticationPanelNotice"
import { AuthenticationPanelRestoring } from "../AuthenticationPanelRestoring"
import type { AuthenticationPanelProps } from "@/modules/auth/authentication-panel/actions"
import { EMPTY, type AuthFieldErrors, type AuthFieldName, type AuthPanelFormState } from "@/modules/auth/authentication-panel/types"

export type {
    AuthActions,
    AuthenticationPanelProps,
} from "@/modules/auth/authentication-panel/actions"
export type {
    AuthCodeCopy,
    AuthDetailsCopy,
    AuthFactorCopy,
    AuthFrame,
    AuthNoticeCopy,
    AuthRestoringCopy,
} from "@/modules/auth/authentication-panel/copy"
export type {
    AuthCode,
    AuthDetails,
    AuthFactor,
    AuthMode,
    AuthPendingAction,
    AuthProvider,
    AuthState,
} from "@/modules/auth/authentication-panel/types"

/** Draw the state-specific authentication block. */
export const AuthenticationPanel = (props: AuthenticationPanelProps) => {
    const values = useRef({ ...EMPTY })
    const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({})
    const clearFieldError = (field: AuthFieldName) => {
        setFieldErrors((current) =>
            current[field] === undefined
                ? current
                : {
                      ...current,
                      [field]: undefined,
                  },
        )
    }
    const setFieldValue: AuthPanelFormState["setFieldValue"] = (field, value) => {
        values.current[field] = value
    }
    const formState: AuthPanelFormState = { values, fieldErrors, setFieldErrors, clearFieldError, setFieldValue }

    switch (props.state) {
        case "details":
            return <AuthenticationPanelDetails {...props} formState={formState} />
        case "code":
            return <AuthenticationPanelCode {...props} formState={formState} />
        case "secondFactor":
            return <AuthenticationPanelFactor {...props} formState={formState} />
        case "restoring":
            return <AuthenticationPanelRestoring {...props} />
        case "done":
        case "twoFactorUnsupported":
        case "notice":
            return <AuthenticationPanelNotice {...props} />
    }
}
