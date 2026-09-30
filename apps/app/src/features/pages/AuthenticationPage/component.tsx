import type { AuthMode, AuthNoticeCopy, AuthPendingAction } from "@/components/blocks/auth/AuthenticationPanel"
import type { AuthNoticeKind, AuthPhase } from "@/modules/auth/authentication"
import type { AuthenticationTranslate } from "@/hooks/auth/auth.shared"
import { NivoBrand, NivoUnicornArtwork } from "@nivo/ui"
import { Heading, SurfaceCard, Text, TextAction } from "@starci/grammar/common"
import { AuthenticationPanel, type AuthenticationPanelProps } from "@/components/blocks/auth/AuthenticationPanel"
import {
    AUTH_EXIT_CLASS_NAME,
    AUTH_EXITS_CLASS_NAME,
    AUTH_HEADING_CLASS_NAME,
    AUTH_PAGE_CLASS_NAME,
    AUTH_TASK_COLUMN_CLASS_NAME,
    AUTH_VIGNETTE_CLASS_NAME,
} from "./classNames"

/** Presentational authentication page: heading, panel and journey exits. */

/** Where the reader may go instead, drawn outside the surface. */
export type AuthenticationPageExit = {
    /** The question the action answers, or `""` for an exit that stands alone. */
    readonly question: string
    /** The action's own words. */
    readonly action: string
    /** What taking it does. */
    readonly onPress: () => void
}

/**
 * Props for {@link AuthenticationPageView}.
 *
 * The connected `index.tsx` owns the unit's one public `AuthenticationPageProps`, so the render
 * half's own contract is named after the export it serves and the two files never carry one name
 * for two shapes.
 */
export type AuthenticationPageViewProps = {
    /** The panel's complete translated state and actions. */
    readonly panel: AuthenticationPanelProps
    /** Everything offered below the surface, in reading order. */
    readonly exits: ReadonlyArray<AuthenticationPageExit>
}

const showsMascot = (panel: AuthenticationPanelProps): boolean => {
    if (panel.state !== "details") return false
    return (
        panel.props.mode === "signIn" &&
        !panel.props.isError &&
        panel.props.statusMessage === "" &&
        !panel.props.isPending
    )
}

/** Draw the authentication screen. */
export const AuthenticationPageView = (props: AuthenticationPageViewProps) => {
    const { panel, exits }: AuthenticationPageViewProps = props
    const panelIdentity =
        panel.state === "details" || panel.state === "code" ? `${panel.state}:${panel.props.mode}` : panel.state

    return (
        <main id="main-content" tabIndex={-1} className={AUTH_PAGE_CLASS_NAME}>
            <section aria-label={panel.props.title} className={AUTH_TASK_COLUMN_CLASS_NAME}>
                <NivoBrand props={{ label: "Nivo", variant: "lockup", scale: "navbar" }} />

                <div className={AUTH_HEADING_CLASS_NAME}>
                    <Heading level={1} scale="display">
                        {panel.props.title}
                    </Heading>
                    <Text size="sm" tone="muted">
                        {panel.props.subtitle}
                    </Text>
                </div>

                <SurfaceCard measure="formCompact" composition="single" frame="bounded">
                    <AuthenticationPanel key={panelIdentity} {...panel} />
                </SurfaceCard>

                <div className={AUTH_EXITS_CLASS_NAME}>
                    {exits.map((exit) => (
                        <div key={`${exit.question}${exit.action}`} className={AUTH_EXIT_CLASS_NAME}>
                            {exit.question === "" ? null : (
                                <Text size="sm" tone="muted">
                                    {exit.question}
                                </Text>
                            )}
                            <TextAction size="sm" onPress={exit.onPress}>
                                {exit.action}
                            </TextAction>
                        </div>
                    ))}
                </div>
            </section>

            {showsMascot(panel) ? (
                <aside aria-hidden="true" className={AUTH_VIGNETTE_CLASS_NAME}>
                    <NivoUnicornArtwork props={{ tone: "brand" }} />
                </aside>
            ) : null}
        </main>
    )
}

type PanelOptions = {
    readonly t: AuthenticationTranslate
    readonly mode: AuthMode
    readonly phase: AuthPhase
    readonly noticeKind: AuthNoticeKind | null
    readonly email: string
    readonly ttlMinutes: number
    readonly cooldownSeconds: number
    readonly isRememberMe: boolean
    readonly isRestoring: boolean
    readonly isSignedInArrival: boolean
    readonly isPending: boolean
    readonly pendingAction: AuthPendingAction | null
    readonly pendingProvider?: "google" | "github"
    readonly statusMessage: string
    readonly isError: boolean
}

/** Resolve the complete translated state for the authentication surface. */
export const authenticationPanelFor = (options: PanelOptions): AuthenticationPanelProps => {
    const {
        t,
        mode,
        phase,
        noticeKind,
        email,
        ttlMinutes,
        cooldownSeconds,
        isRememberMe,
        isRestoring,
        isSignedInArrival,
        isPending,
        pendingAction,
        pendingProvider,
        statusMessage,
        isError,
    } = options
    const frame = {
        title: t(`${mode}.title`),
        subtitle: t(`${mode}.subtitle`),
        isPending,
        pendingAction: pendingAction ?? undefined,
        pendingProvider,
    }
    const baseNotice: AuthNoticeCopy = {
        ...frame,
        statusMessage: "",
        isError: false,
        doneTitle: "",
        doneHint: "",
        onwardLabel: "",
        secondaryLabel: "",
    }

    if (isRestoring || isSignedInArrival)
        return {
            state: "restoring",
            props: {
                title: t("restoringTitle"),
                subtitle: t("restoringSubtitle"),
                progressLabel: t("restoringLabel"),
            },
        }

    if (phase === "notice") {
        if (noticeKind === "heldAddress")
            return {
                state: "notice",
                props: {
                    ...baseNotice,
                    doneTitle: t("signUp.heldAddressTitle"),
                    doneHint: t("signUp.emailTaken"),
                    onwardLabel: t("signUp.heldAddressSignInLabel"),
                    secondaryLabel: t("signUp.heldAddressRecoverLabel"),
                },
            }
        if (noticeKind === "createdNoSession")
            return {
                state: "notice",
                props: {
                    ...baseNotice,
                    doneTitle: t("signUp.createdNoSessionTitle"),
                    doneHint: t("signUp.createdNoSessionNotice"),
                    onwardLabel: t("signUp.createdNoSessionSignInLabel"),
                },
            }
        return {
            state: "notice",
            props: {
                ...baseNotice,
                doneHint:
                    noticeKind === "sessionEndingApplied"
                        ? t("signOut.everywhereAppliedNotice")
                        : t("signOut.unconfirmedNotice"),
                onwardLabel: t("forgotPassword.onwardLabel"),
            },
        }
    }

    if (phase === "twoFactor")
        return {
            state: "secondFactor",
            props: {
                ...frame,
                subtitle: t("signIn.twoFactorSubtitle"),
                statusMessage,
                isError,
                codeLabel: t("codeLabel"),
                codeRequired: t("codeRequired"),
                codeInvalid: t("codeInvalid"),
                submitLabel: t("signIn.twoFactorSubmitLabel"),
                backLabel: t("signIn.backLabel"),
            },
        }

    if (phase === "done")
        return {
            state: "done",
            props: {
                ...frame,
                statusMessage,
                isError,
                doneTitle: t(`${mode}.doneTitle`),
                doneHint: t(`${mode}.doneHint`),
                onwardLabel: t(`${mode}.onwardLabel`),
                secondaryLabel: "",
            },
        }

    if (phase === "code")
        return {
            state: "code",
            props: {
                ...frame,
                mode,
                subtitle: t(`${mode}.codeSubtitle`, { email }),
                statusMessage,
                isError,
                codeLabel: t("codeLabel"),
                codeRequired: t("codeRequired"),
                codeInvalid: t("codeInvalid"),
                codeHint: t("codeHint", { minutes: ttlMinutes }),
                newPasswordLabel: t("newPasswordLabel"),
                newPasswordPlaceholder: t("newPasswordPlaceholder"),
                newPasswordRequired: t("newPasswordRequired"),
                newPasswordTooShort: t("passwordTooShort"),
                newPasswordHint: t("passwordHint"),
                confirmNewPasswordLabel: t("confirmNewPasswordLabel"),
                confirmNewPasswordPlaceholder: t("confirmNewPasswordPlaceholder"),
                confirmNewPasswordRequired: t("confirmNewPasswordRequired"),
                confirmNewPasswordMismatch: t("confirmPasswordMismatch"),
                revealLabel: t("revealLabel"),
                hideLabel: t("hideLabel"),
                submitLabel: t(`${mode}.codeSubmitLabel`),
                resendLabel: t("resendLabel"),
                cooldownLabel: cooldownSeconds === 0 ? "" : t("cooldownLabel", { seconds: cooldownSeconds }),
                backLabel: t("backLabel"),
            },
        }

    return {
        state: "details",
        props: {
            ...frame,
            mode,
            statusMessage,
            isError,
            emailLabel: t("emailLabel"),
            emailPlaceholder: t("emailPlaceholder"),
            emailRequired: t("emailRequired"),
            emailInvalid: t("emailInvalid"),
            emailHint: t("emailHint"),
            passwordLabel: t("passwordLabel"),
            passwordPlaceholder: mode === "signUp" ? t("newPasswordPlaceholder") : t("passwordPlaceholder"),
            passwordRequired: t("passwordRequired"),
            passwordTooShort: t("passwordTooShort"),
            passwordHint: t("passwordHint"),
            confirmPasswordLabel: t("confirmPasswordLabel"),
            confirmPasswordPlaceholder: t("confirmPasswordPlaceholder"),
            confirmPasswordRequired: t("confirmPasswordRequired"),
            confirmPasswordMismatch: t("confirmPasswordMismatch"),
            nameLabel: t("nameLabel"),
            namePlaceholder: t("namePlaceholder"),
            nameHint: t("nameOptionalHint"),
            nameTooLong: t("nameTooLong"),
            authorityHint: t("signUp.authorityHint"),
            revealLabel: t("revealLabel"),
            hideLabel: t("hideLabel"),
            submitLabel: t(mode === "forgotPassword" ? "signUp.submitLabel" : `${mode}.submitLabel`),
            orLabel: t("orLabel"),
            googleLabel: t("googleLabel"),
            githubLabel: t("githubLabel"),
            forgotPasswordLabel: t("forgotPasswordLabel"),
            rememberMeLabel: t("rememberMeLabel"),
            isRememberMe,
        },
    }
}
