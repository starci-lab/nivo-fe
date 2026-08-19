"use client"

import { useRef, useState, type FormEvent } from "react"
import {
    Button, Checkbox, Divider, Field, Heading, Text, TextLink, Tree,
    defineCompositeComponent, defineContractComponent, defineLeafComponent,
} from "@nivo/ui"
import { KeycloakIdentityProvider } from "@/modules/api/auth"

/*
 * PORTED VERBATIM from starci-academy-fe, save for the import block above.
 *
 * WHY A PORT AND NOT A REWRITE. The first attempt narrowed this panel to one step and one lane,
 * reasoning from the nivo academy API's current surface - `signIn { email, password }` and nothing
 * else. That was backwards twice over. The member accounts belong to the EXPERT's own users, so an
 * academy that cannot register them is missing a capability rather than declining one; and the
 * shape this panel was written for is the OTP machine starci's academy backend actually runs -
 * `sign-up/init -> resend -> verify-otp`, the same for sign-in and forgot-password. Narrowing threw
 * away precisely the states the correct backend needs.
 *
 * So the panel arrives whole and the backend catches up. `plan-record.json` carries the enablers -
 * `academy-sign-up`, `academy-password-reset` - and until they land the connected half says so in
 * one sentence rather than failing in a way nobody can read.
 */

/**
 * BLOCK - `AuthenticationPanel`, presentational half.
 *
 * THE STEP IS THE STATE, and the status is not. `details`, `code` and `done` each draw a different
 * tree - a form of two boxes, a form of one, a confirmation - so they are states. `sending`,
 * `verifying` and `resending` draw the SAME tree with a disabled control and a different sentence,
 * so they are props. If it selects a different tree it is a state; otherwise it is props.
 *
 * THE ORDER IS THE DESIGN, and it is not arbitrary. The shortcuts come FIRST because most readers
 * take one and never reach the form; the divider names the choice between them rather than merely
 * separating them; the form follows for the rest; and the way to the other journey is the last
 * line, phrased as a question and its answer rather than as a row of equal buttons - which is what
 * makes one of them read as the main action and the rest as alternatives.
 *
 * THE VALUES ARE UNCONTROLLED, held in a ref. A form that re-renders on every keystroke drops
 * characters on a slow phone, and nothing here needs to see a half-typed address.
 */

/** Which journey the reader is on. */
export type AuthMode = "signIn" | "signUp" | "forgotPassword"

/** What the reader hands over at the first step. */
export type AuthDetails = {
    /** The address the code is sent to. */
    readonly email: string
    /** The secret, whichever journey names it. */
    readonly password: string
}

/** What the reader hands over at the second step. */
export type AuthCode = {
    /** The one-time code from their inbox. */
    readonly otp: string
}

/** Copy shared by every step of every journey. */
export type AuthPanelFrame = {
    /** What the surface is called while this journey is on screen. */
    readonly title: string
    /** The line under the title, saying what the reader is here to do. */
    readonly subtitle: string
    /** The one sentence that goes with whatever is happening. Empty when nothing is. */
    readonly statusMessage: string
    /** Whether that sentence is a refusal, so it is announced rather than merely shown. */
    readonly isError: boolean
    /** Whether a request is already on its way, so the controls refuse a second press. */
    readonly isPending: boolean
}

/** Copy for the first step. */
export type AuthDetailsCopy = {
    readonly emailLabel: string
    readonly emailPlaceholder: string
    readonly passwordLabel: string
    readonly passwordPlaceholder: string
    readonly passwordHint: string
    readonly revealLabel: string
    readonly hideLabel: string
    readonly confirmPasswordLabel: string
    readonly confirmPasswordPlaceholder: string
    readonly confirmPasswordMismatch: string
    readonly submitLabel: string
    readonly orLabel: string
    /**
     * The one provider this academy offers.
     *
     * GitHub was here and is gone: it is a developer's account, and the reader
     * this panel is written for is a student buying a craft course. An entry
     * screen offering a lane almost nobody in the audience holds does not add a
     * choice, it adds a thing to skip past.
     */
    readonly oauthGoogle: string
    readonly rememberMeLabel: string
    readonly forgotPassword: string
    readonly agreeToTerms: string
    readonly agreeToTermsPrefix: string
    readonly termsLabel: string
    readonly andLabel: string
    readonly privacyLabel: string
    /** The last line: a question, and the answer that switches journey. */
    readonly promptQuestion: string
    readonly promptAction: string
}

/** Copy for the second step. */
export type AuthCodeCopy = {
    readonly codeLabel: string
    readonly codePlaceholder: string
    readonly codeHint: string
    readonly submitLabel: string
    readonly resendLabel: string
    readonly useAnotherEmailLabel: string
}

/** Copy for the confirmation. */
export type AuthDoneCopy = {
    readonly doneTitle: string
    readonly doneHint: string
}

/** Props for {@link AuthenticationPanelBase}, discriminated by the step. */
export type AuthenticationPanelProps =
    | {
        readonly state: "details"
        readonly props: AuthPanelFrame & AuthDetailsCopy & {
            readonly mode: AuthMode
            readonly hasAgreedToTerms: boolean
            readonly rememberMe: boolean
        }
    }
    | { readonly state: "code"; readonly props: AuthPanelFrame & AuthCodeCopy }
    | { readonly state: "done"; readonly props: AuthPanelFrame & AuthDoneCopy }

/** What the panel reports. */
export type AuthenticationPanelActions = {
    readonly submitDetails?: (details: AuthDetails) => void
    readonly submitCode?: (code: AuthCode) => void
    readonly resend?: () => void
    readonly changeMode?: (mode: AuthMode) => void
    readonly changeAgreedToTerms?: (agreed: boolean) => void
    readonly changeRememberMe?: (remember: boolean) => void
    readonly openLegal?: (kind: "terms" | "privacy") => void
    readonly oauthPress?: (provider: KeycloakIdentityProvider) => void
}

/** The id the dialog points its label at, so the surface is named by its own title. */
export const AUTHENTICATION_PANEL_TITLE_ID = "authentication-panel-title"

/** Field ids, so every label reaches the box it names. */
const EMAIL_ID = "authentication-email"
const PASSWORD_ID = "authentication-password"
const CONFIRM_PASSWORD_ID = "authentication-confirm-password"
const CODE_ID = "authentication-code"

/** What the form starts with. */
const EMPTY_VALUES = { email: "", password: "", confirmPassword: "", otp: "" }

/** The situation this panel is in, plus the actions it exposes. */
type AuthenticationPanelInput = AuthenticationPanelProps & {
    readonly on?: AuthenticationPanelActions
}

/**
 * Render the panel.
 *
 * @param input - {@link AuthenticationPanelInput}
 */
export const AuthenticationPanelBase = (input: AuthenticationPanelInput) => {
    const values = useRef({ ...EMPTY_VALUES })
    const [hasConfirmationMismatch, setHasConfirmationMismatch] = useState(false)

    /** The name of the surface, over the line that says what it is for. */
    const header = defineContractComponent("centred-title-pair", {
        title: defineLeafComponent("heading", {}, () => (
            <span id={AUTHENTICATION_PANEL_TITLE_ID}>
                <Heading props={{ content: input.props.title, level: 2 }} />
            </span>
        )),
        description: defineLeafComponent("text", { size: "sm" }, () => (
            <Text props={{ content: input.props.subtitle, size: "sm", tone: "muted" }} />
        )),
    })

    /** The one sentence, announced when it is a refusal and merely shown when it is not. */
    const status = input.props.statusMessage === "" ? undefined : defineLeafComponent("text", {}, () => (
        <Text
            props={{
                content: input.props.statusMessage,
                tone: input.props.isError ? "default" : "muted",
                size: "sm",
                live: input.props.isError ? "assertive" : "polite",
            }}
        />
    ))

    if (input.state === "done") {
        return (
            <Tree
                contract="centred-page-column"
                render={defineContractComponent("centred-page-column", {
                    header,
                    body: [
                        defineContractComponent("centred-title-pair", {
                            title: defineLeafComponent("heading", {}, () => (
                                <Heading props={{ content: input.props.doneTitle, level: 3 }} />
                            )),
                            description: defineLeafComponent("text", { size: "sm" }, () => (
                                <Text props={{ content: input.props.doneHint, tone: "muted", size: "sm" }} />
                            )),
                        }),
                        ...(status === undefined ? [] : [defineContractComponent("stacked-peer-controls", {
                            control: [status],
                        })]),
                    ],
                })}
            />
        )
    }

    if (input.state === "code") {
        const submit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            input.on?.submitCode?.({ otp: values.current.otp })
        }
        return (
            <Tree
                contract="centred-page-column"
                render={defineContractComponent("centred-page-column", {
                    header,
                    body: [
                        defineLeafComponent("form", {}, () => (
                            <form onSubmit={submit}>
                                <Tree
                                    contract="stacked-peer-controls"
                                    render={defineContractComponent("stacked-peer-controls", {
                                        control: [
                                            defineCompositeComponent("field", {}, () => (
                                                <Field
                                                    props={{
                                                        id: CODE_ID,
                                                        name: "otp",
                                                        kind: "code",
                                                        label: input.props.codeLabel,
                                                        placeholder: input.props.codePlaceholder,
                                                        hint: input.props.codeHint,
                                                        disabled: input.props.isPending,
                                                    }}
                                                    on={{ change: (value) => { values.current.otp = value } }}
                                                />
                                            )),
                                            ...(status === undefined ? [] : [status]),
                                            defineLeafComponent("button", {}, () => (
                                                <Button
                                                    props={{
                                                        label: input.props.submitLabel,
                                                        variant: "primary",
                                                        type: "submit",
                                                        disabled: input.props.isPending,
                                                        isPending: input.props.isPending,
                                                    }}
                                                />
                                            )),
                                        ],
                                    })}
                                />
                            </form>
                        )),
                        defineContractComponent("spread-choice-row", {
                            choice: defineLeafComponent("text-link", { size: "sm" }, () => (
                                <TextLink props={{ label: input.props.resendLabel, size: "sm" }} on={{ press: input.on?.resend }} />
                            )),
                            exit: defineLeafComponent("text-link", { size: "sm" }, () => (
                                <TextLink
                                    props={{ label: input.props.useAnotherEmailLabel, size: "sm" }}
                                    on={{ press: () => input.on?.changeMode?.("signIn") }}
                                />
                            )),
                        }),
                    ],
                })}
            />
        )
    }

    // The terms are the ONE thing that can hold a submission back before it is attempted, and only
    // when an account is being opened. Signing in and resetting a password agree to nothing new.
    const isBlockedByTerms = input.props.mode === "signUp" && !input.props.hasAgreedToTerms
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (input.props.mode === "signUp" && values.current.password !== values.current.confirmPassword) {
            setHasConfirmationMismatch(true)
            return
        }
        setHasConfirmationMismatch(false)
        input.on?.submitDetails?.({ email: values.current.email, password: values.current.password })
    }

    return (
        <Tree
            contract="centred-page-column"
            render={defineContractComponent("centred-page-column", {
                header,
                body: [
                    defineContractComponent("auth-entry-stack", {
                        shortcuts: defineContractComponent("auth-shortcuts-over-divider", {
                            shortcut: [
                                defineLeafComponent("button", {}, () => (
                                    <Button
                                        props={{ label: input.props.oauthGoogle, variant: "outline", icon: "google", disabled: input.props.isPending }}
                                        on={{ press: () => input.on?.oauthPress?.(KeycloakIdentityProvider.Google) }}
                                    />
                                )),
                            ],
                            divider: defineLeafComponent("divider", {}, () => (
                                <Divider props={{ label: input.props.orLabel }} />
                            )),
                        }),
                        credentials: defineLeafComponent("form", {}, () => (
                            <form onSubmit={submit}>
                                <Tree
                                    contract="stacked-peer-controls"
                                    render={defineContractComponent("stacked-peer-controls", {
                                        control: [
                                            defineCompositeComponent("field", {}, () => (
                                                <Field
                                                    props={{
                                                        id: EMAIL_ID,
                                                        name: "email",
                                                        kind: "email",
                                                        label: input.props.emailLabel,
                                                        placeholder: input.props.emailPlaceholder,
                                                        disabled: input.props.isPending,
                                                    }}
                                                    on={{ change: (value) => { values.current.email = value } }}
                                                />
                                            )),
                                            defineCompositeComponent("field", {}, () => (
                                                <Field
                                                    props={{
                                                        id: PASSWORD_ID,
                                                        name: "password",
                                                        kind: input.props.mode === "signIn" ? "password" : "newPassword",
                                                        label: input.props.passwordLabel,
                                                        placeholder: input.props.passwordPlaceholder,
                                                        hint: input.props.passwordHint === "" ? undefined : input.props.passwordHint,
                                                        revealLabel: input.props.revealLabel,
                                                        hideLabel: input.props.hideLabel,
                                                        disabled: input.props.isPending,
                                                    }}
                                                    on={{ change: (value) => { values.current.password = value } }}
                                                />
                                            )),
                                            ...(input.props.mode !== "signUp" ? [] : [
                                                defineCompositeComponent("field", {}, () => (
                                                    <Field
                                                        props={{
                                                            id: CONFIRM_PASSWORD_ID,
                                                            name: "confirmPassword",
                                                            kind: "newPassword",
                                                            label: input.props.confirmPasswordLabel,
                                                            placeholder: input.props.confirmPasswordPlaceholder,
                                                            hint: hasConfirmationMismatch ? input.props.confirmPasswordMismatch : undefined,
                                                            isInvalid: hasConfirmationMismatch,
                                                            revealLabel: input.props.revealLabel,
                                                            hideLabel: input.props.hideLabel,
                                                            disabled: input.props.isPending,
                                                        }}
                                                        on={{
                                                            change: (value) => {
                                                                values.current.confirmPassword = value
                                                                if (hasConfirmationMismatch) setHasConfirmationMismatch(false)
                                                            },
                                                        }}
                                                    />
                                                )),
                                            ]),
                                            defineContractComponent("spread-choice-row", {
                                                choice: defineLeafComponent("checkbox", {}, () => (
                                                    input.props.mode === "signUp" ? (
                                                        <Checkbox
                                                            props={{
                                                                label: input.props.agreeToTerms,
                                                                labelParts: [
                                                                    { kind: "text", content: `${input.props.agreeToTermsPrefix} ` },
                                                                    { kind: "link", id: "terms", label: input.props.termsLabel },
                                                                    { kind: "text", content: ` ${input.props.andLabel} ` },
                                                                    { kind: "link", id: "privacy", label: input.props.privacyLabel },
                                                                ],
                                                                isSelected: input.props.hasAgreedToTerms,
                                                            }}
                                                            on={{
                                                                change: (agreed) => input.on?.changeAgreedToTerms?.(agreed),
                                                                follow: (kind) => {
                                                                    if (kind === "terms" || kind === "privacy") input.on?.openLegal?.(kind)
                                                                },
                                                            }}
                                                        />
                                                    ) : (
                                                        <Checkbox
                                                            props={{ label: input.props.rememberMeLabel, isSelected: input.props.rememberMe }}
                                                            on={{ change: (remember) => input.on?.changeRememberMe?.(remember) }}
                                                        />
                                                    )
                                                )),
                                                exit: input.props.mode !== "signIn" ? undefined : defineLeafComponent("text-link", { size: "sm" }, () => (
                                                    <TextLink
                                                        props={{ label: input.props.forgotPassword, size: "sm" }}
                                                        on={{ press: () => input.on?.changeMode?.("forgotPassword") }}
                                                    />
                                                )),
                                            }),
                                            ...(status === undefined ? [] : [status]),
                                            defineLeafComponent("button", {}, () => (
                                                <Button
                                                    props={{
                                                        label: input.props.submitLabel,
                                                        variant: "primary",
                                                        type: "submit",
                                                        disabled: input.props.isPending || isBlockedByTerms,
                                                        isPending: input.props.isPending,
                                                    }}
                                                />
                                            )),
                                        ],
                                    })}
                                />
                            </form>
                        )),
                    }),
                ],
                footer: defineContractComponent("centred-prompt-row", {
                    prompt: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text props={{ content: input.props.promptQuestion, size: "sm", tone: "muted" }} />
                    )),
                    action: defineLeafComponent("text-link", { size: "sm" }, () => (
                        <TextLink
                            props={{ label: input.props.promptAction, size: "sm" }}
                            on={{ press: () => input.on?.changeMode?.(input.props.mode === "signIn" ? "signUp" : "signIn") }}
                        />
                    )),
                }),
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "pure", domain: "auth" } as const
