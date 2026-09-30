import type { AuthDetailsCopy } from "@/modules/auth/authentication-panel/copy"
import type { AuthActions } from "@/modules/auth/authentication-panel/actions"
import type { AuthFieldErrors, AuthFieldName } from "@/modules/auth/authentication-panel/types"

/** Resolved first-step fields and the actions the drawing half can emit. */
export type AuthenticationPanelDetailsBaseProps = {
    readonly props: {
        readonly copy: AuthDetailsCopy
        readonly fieldErrors: AuthFieldErrors
        readonly announcement: "assertive" | "polite"
    }
    readonly on: {
        readonly submit: () => void
        readonly changeField: (field: AuthFieldName, value: string) => void
        readonly changeRememberMe: AuthActions["changeRememberMe"]
        readonly changeMode: AuthActions["changeMode"]
        readonly chooseProvider: AuthActions["chooseProvider"]
    }
}
