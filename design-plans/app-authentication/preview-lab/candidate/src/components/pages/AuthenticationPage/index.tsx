"use client"

import { useTranslations } from "next-intl"
import { SurfaceFormCard, Tree, defineContractComponent, defineContractProjection } from "@nivo/ui"
import { AuthenticationPanel, type AuthMode } from "../../blocks/auth/AuthenticationPanel"

/**
 * PAGE - `/authentication`, the one route all three journeys live on.
 *
 * TARGET PATH: `apps/app/src/components/pages/AuthenticationPage/component.tsx`.
 * ROUTE: `apps/app/src/app/[locale]/(auth)/authentication/page.tsx`, which mounts it and nothing else.
 *
 * ONE ROUTE, WHICH IS THE REFERENCE'S OWN SHAPE. starci has exactly one authentication address and no
 * `/sign-up` or `/forgot-password` beside it; the mode is panel state, not a URL. Revisions 1.0 and
 * 1.1 had three routes, and this is what 1.2 undid.
 *
 * THE PAGE OWNS WHICH MODE AND WHICH STEP, and nothing else. The panel owns what is asked. There are
 * no layout classes here: the registry owns how the surface sits, and `SurfaceFormCard` is the branch
 * that gives `authentication-panel-card` a real card - exactly as `AuthenticationPage/component.tsx`
 * does in the reference.
 *
 * IN THE CANDIDATE THIS IS DRIVEN BY PROPS so a static export can seal each state. On materialization
 * the same file becomes the pure half and `index.tsx` beside it resolves the world:
 *
 * - signIn details    -> `signIn({ email, password })`; read `requiresTwoFactor` BEFORE `accessToken`
 * - signUp details    -> `signUpInit` -> code -> `signUpVerifyOtp` -> a session
 * - forgot details    -> `forgotPasswordInit` -> code -> `forgotPasswordVerifyOtp` -> a BOOLEAN
 */

/** Which step, and in what condition, the screen is in. */
export type AuthPhase = "details" | "detailsRefused" | "code" | "codeRefused" | "codeCooldown" | "codeTaken" | "done" | "twoFactor"

/** Props for {@link AuthenticationPage}. */
export interface AuthenticationPageProps {
    /** Which journey is running. */
    readonly mode: AuthMode
    /** The state being rendered. */
    readonly phase: AuthPhase
}

/** The address the fixture journey is for. It appears in the code step's lead, so it is fixed. */
const FIXTURE_EMAIL = "ban@congty.vn"

/** How long a challenge lasts, in minutes, as the backend reports it. */
const FIXTURE_TTL_MINUTES = 10

/** How much of the sixty-second cooldown is left in the fixture that shows one. */
const FIXTURE_COOLDOWN_SECONDS = 47

/**
 * The authentication screen.
 *
 * @param props - {@link AuthenticationPageProps}
 * @returns The page node.
 */
export const AuthenticationPage = ({ mode, phase }: AuthenticationPageProps) => {
    const t = useTranslations("authentication")
    const isCodeStep = phase === "code" || phase === "codeRefused" || phase === "codeCooldown" || phase === "codeTaken"

    const frame = {
        title: t(`${mode}.title`),
        subtitle: t(`${mode}.subtitle`),
        isPending: false,
    }

    const panel = phase === "twoFactor"
        ? (
            <AuthenticationPanel
                state="twoFactorUnsupported"
                props={{
                    ...frame,
                    statusMessage: "",
                    // A challenge is not a refusal: the password was right and the session is simply
                    // not owed yet.
                    isError: false,
                    doneTitle: t("signIn.twoFactorTitle"),
                    doneHint: t("signIn.twoFactorHint"),
                    onwardLabel: t("signIn.backLabel"),
                }}
            />
        )
        : phase === "done"
            ? (
                <AuthenticationPanel
                    state="done"
                    props={{
                        ...frame,
                        statusMessage: "",
                        isError: false,
                        doneTitle: t(`${mode}.doneTitle`),
                        doneHint: t(`${mode}.doneHint`),
                        onwardLabel: t(`${mode}.onwardLabel`),
                    }}
                />
            )
            : isCodeStep
                ? (
                    <AuthenticationPanel
                        state="code"
                        props={{
                            ...frame,
                            mode,
                            subtitle: t(`${mode}.codeSubtitle`, { email: FIXTURE_EMAIL }),
                            statusMessage: phase === "codeRefused"
                                ? t(`${mode}.codeRefused`)
                                : phase === "codeTaken" ? t("signUp.emailTaken") : "",
                            isError: phase === "codeRefused" || phase === "codeTaken",
                            codeLabel: t("codeLabel"),
                            codePlaceholder: t("codePlaceholder"),
                            codeHint: t("codeHint", { minutes: FIXTURE_TTL_MINUTES }),
                            newPasswordLabel: t("newPasswordLabel"),
                            newPasswordPlaceholder: t("newPasswordPlaceholder"),
                            newPasswordHint: t("newPasswordHint"),
                            revealLabel: t("revealLabel"),
                            hideLabel: t("hideLabel"),
                            submitLabel: t(`${mode}.codeSubmitLabel`),
                            resendLabel: t("resendLabel"),
                            cooldownLabel: phase === "codeCooldown" ? t("cooldownLabel", { seconds: FIXTURE_COOLDOWN_SECONDS }) : "",
                            backLabel: t("backLabel"),
                        }}
                    />
                )
                : (
                    <AuthenticationPanel
                        state="details"
                        props={{
                            ...frame,
                            mode,
                            statusMessage: phase === "detailsRefused" ? t("signIn.refused") : "",
                            isError: phase === "detailsRefused",
                            emailLabel: t("emailLabel"),
                            emailPlaceholder: t("emailPlaceholder"),
                            emailHint: t("emailHint"),
                            passwordLabel: t("passwordLabel"),
                            passwordPlaceholder: mode === "signUp" ? t("newAccountPasswordPlaceholder") : t("passwordPlaceholder"),
                            passwordHint: t("passwordHint"),
                            confirmPasswordLabel: t("confirmPasswordLabel"),
                            confirmPasswordPlaceholder: t("confirmPasswordPlaceholder"),
                            confirmPasswordMismatch: t("confirmPasswordMismatch"),
                            revealLabel: t("revealLabel"),
                            hideLabel: t("hideLabel"),
                            submitLabel: t(`${mode}.submitLabel`),
                            orLabel: t("orLabel"),
                            googleLabel: t("googleLabel"),
                            forgotPasswordLabel: t("forgotPasswordLabel"),
                            rememberMeLabel: t("rememberMeLabel"),
                            isRememberMe: false,
                            promptQuestion: t(`${mode}.promptQuestion`),
                            promptAction: t(`${mode}.promptAction`),
                        }}
                    />
                )

    /*
     * THE CARD IS A REAL SURFACE, not a max-width. `authentication-panel-card` on its own is two
     * classes; `SurfaceFormCard` is what puts a border, a ground and an elevation around it.
     */
    const cardContent = defineContractComponent("authentication-panel-card", {
        panel: defineContractProjection("centred-page-column", () => panel),
    })

    return (
        <Tree
            contract="centred-authentication-page"
            render={defineContractComponent("centred-authentication-page", {
                surface: defineContractProjection("authentication-panel-card", () => (
                    <SurfaceFormCard contract="authentication-panel-card" render={cardContent} />
                )),
            })}
        />
    )
}
