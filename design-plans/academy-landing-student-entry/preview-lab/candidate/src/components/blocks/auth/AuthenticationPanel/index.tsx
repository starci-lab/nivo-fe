"use client"

import { useCallback, useState } from "react"
import { useTranslations } from "next-intl"
import { useAuthPanel } from "@/hooks/auth/useAuthPanel"
import { KeycloakIdentityProvider } from "@/modules/api/auth"
import {
    _AuthenticationPanel,
    type AuthMode,
    type AuthenticationPanelProps as PanelProps,
} from "./component"

/**
 * BLOCK - `AuthenticationPanel`, connected half.
 *
 * It owns the auth machine and nothing about where it is drawn. That is what
 * lets the SAME block be mounted by the `/[locale]/sign-in` route and by
 * `SignInOverlay`: neither host can teach it which one it is inside, so the two
 * cannot drift apart.
 *
 * THREE LANES, BECAUSE THE MEMBERS ARE THE EXPERT'S OWN USERS. An academy
 * member account has nothing to do with a nivo account, so this academy
 * registers its own people, signs them in, and lets them recover a password.
 * All three now exist on the API -- `signUpInit/Resend/VerifyOtp` and their
 * sign-in and forgot-password twins -- so the earlier "this lane is not
 * available yet" sentence is gone along with the gap it described.
 *
 * WHAT THIS HALF DECIDES AND WHAT IT DOES NOT. It maps machine state to copy
 * and nothing else. The step, the pending flag and every refusal come from
 * {@link useAuthPanel}; the local state here is only the two controls the
 * backend has no opinion about -- the terms checkbox and remember-me, which is
 * a control the API cannot yet honour and therefore does not claim to.
 */

/** Props for {@link AuthenticationPanel}. */
export type AuthenticationPanelProps = {
    /** Which lane to open on. The route opens on sign-in; the overlay may differ. */
    readonly initialMode?: AuthMode
    /** What to do once a session exists. The route redirects; the overlay closes. */
    readonly onSignedIn: () => void
}

/**
 * Run the entry lanes.
 *
 * @param input - {@link AuthenticationPanelProps}
 * @returns The panel.
 */
export const AuthenticationPanel = ({ initialMode = "signIn", onSignedIn }: AuthenticationPanelProps) => {
    const t = useTranslations("entry")
    const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    const panel = useAuthPanel({
        initialMode,
        onSignedIn: useCallback(() => {
            onSignedIn()
        }, [onSignedIn]),
    })

    /** Copy every step shows, whichever step it is. */
    const frame = {
        title: t(`${panel.mode}.title`),
        subtitle: t(`${panel.mode}.body`),
        statusMessage: panel.message,
        isError: panel.isError,
        isPending: panel.isPending,
    }

    const leave = useCallback((provider: KeycloakIdentityProvider) => {
        // The redirect belongs to the route that owns the return address: an
        // overlay that is dismissed has no address to come back to, so the
        // provider lanes always leave through the page.
        window.location.assign(`/sign-in?provider=${provider}`)
    }, [])

    const props: PanelProps = panel.step === "details"
        ? {
            state: "details",
            props: {
                ...frame,
                mode: panel.mode,
                hasAgreedToTerms,
                rememberMe,
                emailLabel: t("email"),
                emailPlaceholder: t("emailPlaceholder"),
                passwordLabel: panel.mode === "forgotPassword" ? t("newPassword") : t("password"),
                passwordPlaceholder: panel.mode === "forgotPassword"
                    ? t("newPasswordPlaceholder")
                    : t("passwordPlaceholder"),
                passwordHint: t("passwordHint"),
                revealLabel: t("reveal"),
                hideLabel: t("hide"),
                confirmPasswordLabel: t("confirmPassword"),
                confirmPasswordPlaceholder: t("confirmPasswordPlaceholder"),
                confirmPasswordMismatch: t("passwordMismatch"),
                submitLabel: t(`${panel.mode}.submit`),
                orLabel: t("or"),
                oauthGoogle: t("google"),
                oauthGithub: t("github"),
                rememberMeLabel: t("rememberMe"),
                forgotPassword: t("forgotPasswordLink"),
                agreeToTerms: t("agreeToTerms"),
                agreeToTermsPrefix: t("agreeToTermsPrefix"),
                termsLabel: t("terms"),
                andLabel: t("and"),
                privacyLabel: t("privacy"),
                promptQuestion: t(`${panel.mode}.switchPrompt`),
                promptAction: t(`${panel.mode}.switchAction`),
            },
        }
        : panel.step === "code"
            ? {
                state: "code",
                props: {
                    ...frame,
                    codeLabel: t("codeLabel"),
                    codePlaceholder: t("codePlaceholder"),
                    // the countdown is the API's own number, not a guess
                    codeHint: t("codeHint", { minutes: Math.max(1, Math.ceil(panel.expiresInSeconds / 60)) }),
                    submitLabel: t("codeSubmit"),
                    resendLabel: t("resend"),
                    useAnotherEmailLabel: t("useAnotherEmail"),
                },
            }
            : {
                state: "done",
                props: {
                    ...frame,
                    doneTitle: t(`${panel.mode}.doneTitle`),
                    doneHint: t(`${panel.mode}.doneHint`),
                },
            }

    return (
        <_AuthenticationPanel
            {...props}
            on={{
                submitDetails: panel.submitDetails,
                submitCode: panel.submitCode,
                resend: panel.resend,
                changeMode: panel.changeMode,
                changeAgreedToTerms: setHasAgreedToTerms,
                changeRememberMe: setRememberMe,
                oauthPress: leave,
            }}
        />
    )
}

/** Source-level tier marker. */
export const meta = { world: "connected", domain: "auth" } as const
