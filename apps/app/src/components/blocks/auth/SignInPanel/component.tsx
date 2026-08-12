import { useRef, type FormEvent } from "react"
import {
    Button,
    Divider,
    Field,
    Heading,
    Text,
    TextLink,
    Tree,
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
    type BlockProps,
} from "@nivo/ui"

/**
 * BLOCK - `SignInPanel`, presentational half.
 *
 * THE SHORTCUTS COME FIRST because most readers take one and never reach the form. The divider
 * closes that choice rather than merely separating it, and the credential form follows for everyone
 * else. That order is the approved design, not a default.
 *
 * WHETHER THE FORM IS OPEN IS PROPS, NOT STATE. It draws the SAME tree either way - the same two
 * shortcuts, the same divider, the same fields - and only its visibility changes. A thing that
 * selects a different tree is a state; a thing that changes how one tree looks is props.
 *
 * THE FORM STAYS IN THE DOM WHILE CLOSED, and this is the whole reason the closed look is a class
 * rather than an early return. A password manager finds fields by reading the document at load; a
 * form mounted only after a press is a form it never saw, so autofill silently stops working. The
 * approved design named that risk, and keeping the fields mounted is what answers it.
 *
 * WHY A SIGN-IN THAT MEETS A SECOND FACTOR HAS ITS OWN STATE. The backend hands those accounts a
 * CHALLENGE rather than a session, so they have not failed to sign in and they have not signed in.
 * Reusing the refusal sentence would tell them their password was wrong, which is false.
 *
 * THE VALUES ARE UNCONTROLLED, held in a ref. A form that re-renders on every keystroke drops
 * characters on a slow phone, and nothing here needs to see a half-typed address.
 */

/** The identity providers this product signs in with. Two, because two callback routes exist. */
export type SignInProvider = "google" | "github"

/** Which tree the panel draws. Each one is a different thing being asked or said. */
export type SignInState =
    /** The two shortcuts and the credential form. */
    | "entry"
    /** The account holds a second factor, which this build cannot complete. */
    | "twoFactorUnsupported"
    /** A reset link was requested. */
    | "resetLinkSent"
    /** A shortcut was pressed and the browser is leaving for the provider. */
    | "handingOff"
    /** The callback route is exchanging the authorization code. */
    | "exchanging"
    /** The exchange was refused. */
    | "exchangeFailed"

/** What the reader hands over. */
export type SignInCredentials = {
    readonly email: string
    readonly password: string
}

/** Copy and situation shared by every tree here. Already resolved - a block never translates. */
export type SignInFrame = {
    readonly title: string
    readonly subtitle: string
    /**
     * The one sentence that goes with whatever is happening, or `""` when nothing is.
     *
     * A REFUSAL MUST NOT SAY WHETHER THE EMAIL EXISTS. The backend refuses to disclose it, and a
     * sentence naming the account would give away what the API deliberately withholds.
     */
    readonly statusMessage: string
    /** Whether that sentence is a refusal, so it is announced rather than merely shown. */
    readonly isError: boolean
    /** A request is already on its way, so every control refuses a second press. */
    readonly isPending: boolean
}

/** Copy for the entry tree. */
export type SignInEntryCopy = SignInFrame & {
    readonly emailLabel: string
    readonly emailPlaceholder: string
    readonly passwordLabel: string
    readonly passwordPlaceholder: string
    readonly revealLabel: string
    readonly hideLabel: string
    readonly submitLabel: string
    readonly orLabel: string
    readonly googleLabel: string
    readonly githubLabel: string
    readonly forgotPasswordLabel: string
    /** Opens the credential form. Shown only while the form is closed. */
    readonly useCredentialsLabel: string
    /** The way out of signing in: opening an account instead. */
    readonly signUpLabel: string
    /** `false` puts the form behind one press; the fields stay mounted either way. */
    readonly isCredentialsOpen: boolean
}

/** Copy for a tree that says one thing and offers one way onward. */
export type SignInNoticeCopy = SignInFrame & {
    readonly onwardLabel: string
}

/** Copy for a tree that is waiting on something outside this page. */
export type SignInWaitingCopy = SignInFrame

/** What the panel can do. */
export type SignInActions = {
    /** Leave for a provider. */
    readonly chooseProvider?: (provider: SignInProvider) => void
    /** Submit the credentials. */
    readonly submitCredentials?: (credentials: SignInCredentials) => void
    /** Reveal the credential form. */
    readonly openCredentials?: () => void
    /** Leave for the sign-up journey. */
    readonly signUp?: () => void
    /** Ask for a reset link. */
    readonly forgotPassword?: () => void
    /** Leave whatever dead end the reader is in and start again. */
    readonly startOver?: () => void
    /** Try the failed exchange again. */
    readonly retry?: () => void
}

/**
 * Props for {@link SignInPanel}.
 *
 * A union per state, so the copy of a tree the panel is NOT drawing cannot be passed and the copy
 * of the one it IS drawing cannot be forgotten.
 */
export type SignInPanelProps =
    | (BlockProps<"entry", SignInEntryCopy> & { readonly on?: SignInActions })
    | (BlockProps<"twoFactorUnsupported", SignInNoticeCopy> & { readonly on?: SignInActions })
    | (BlockProps<"resetLinkSent", SignInNoticeCopy> & { readonly on?: SignInActions })
    | (BlockProps<"exchangeFailed", SignInNoticeCopy> & { readonly on?: SignInActions })
    | (BlockProps<"handingOff", SignInWaitingCopy> & { readonly on?: SignInActions })
    | (BlockProps<"exchanging", SignInWaitingCopy> & { readonly on?: SignInActions })

/** The id the email label points at. */
const EMAIL_ID = "sign-in-email"
/** The id the password label points at. */
const PASSWORD_ID = "sign-in-password"

/**
 * Draw the sign-in panel.
 *
 * @param input - {@link SignInPanelProps}
 */
export const SignInPanel = (input: SignInPanelProps) => {
    // Written to on every keystroke, so the ref's own type is mutable even though what leaves this
    // block on submit is the readonly {@link SignInCredentials}.
    const values = useRef<{ email: string, password: string }>({ email: "", password: "" })

    const header = defineContractComponent("centred-title-pair", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: input.props.title, level: 2 }} />
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
                tone: "muted",
                size: "sm",
                live: input.props.isError ? "assertive" : "polite",
            }}
        />
    ))

    if (input.state === "handingOff" || input.state === "exchanging") {
        return (
            <Tree
                contract="centred-page-column"
                render={defineContractComponent("centred-page-column", {
                    header,
                    body: status === undefined ? [] : [defineContractComponent("stacked-peer-controls", {
                        control: [status],
                    })],
                })}
            />
        )
    }

    // Listed rather than written as "not entry": the arms share multi-state discriminants, so
    // excluding one state leaves the other two arms both possible and the copy type unresolved.
    if (
        input.state === "twoFactorUnsupported"
        || input.state === "resetLinkSent"
        || input.state === "exchangeFailed"
    ) {
        return (
            <Tree
                contract="centred-page-column"
                render={defineContractComponent("centred-page-column", {
                    header,
                    body: [defineContractComponent("stacked-peer-controls", {
                        control: [
                            ...(status === undefined ? [] : [status]),
                            defineLeafComponent("button", {}, () => (
                                <Button
                                    props={{ label: input.props.onwardLabel, variant: "outline" }}
                                    on={{ press: input.on?.startOver ?? input.on?.retry }}
                                />
                            )),
                        ],
                    })],
                })}
            />
        )
    }

    const copy = input.props
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        input.on?.submitCredentials?.({ email: values.current.email, password: values.current.password })
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
                                        props={{ label: copy.googleLabel, variant: "outline", icon: "google", disabled: copy.isPending }}
                                        on={{ press: () => input.on?.chooseProvider?.("google") }}
                                    />
                                )),
                                defineLeafComponent("button", {}, () => (
                                    <Button
                                        props={{ label: copy.githubLabel, variant: "outline", icon: "github", disabled: copy.isPending }}
                                        on={{ press: () => input.on?.chooseProvider?.("github") }}
                                    />
                                )),
                            ],
                            divider: defineLeafComponent("divider", {}, () => (
                                <Divider props={{ label: copy.orLabel }} />
                            )),
                        }),
                        credentials: defineLeafComponent("form", {}, () => (
                            <>
                                {copy.isCredentialsOpen ? null : (
                                    <Button
                                        props={{ label: copy.useCredentialsLabel, variant: "outline", disabled: copy.isPending }}
                                        on={{ press: input.on?.openCredentials }}
                                    />
                                )}
                                {/*
                                  * `hidden` rather than unmounted: the fields must exist in the
                                  * document at load for a password manager to offer to fill them.
                                  */}
                                <form onSubmit={submit} hidden={!copy.isCredentialsOpen}>
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
                                                            label: copy.emailLabel,
                                                            placeholder: copy.emailPlaceholder,
                                                            disabled: copy.isPending,
                                                            isInvalid: copy.isError,
                                                        }}
                                                        on={{ change: (value) => { values.current.email = value } }}
                                                    />
                                                )),
                                                defineCompositeComponent("field", {}, () => (
                                                    <Field
                                                        props={{
                                                            id: PASSWORD_ID,
                                                            name: "password",
                                                            kind: "password",
                                                            label: copy.passwordLabel,
                                                            placeholder: copy.passwordPlaceholder,
                                                            disabled: copy.isPending,
                                                            isInvalid: copy.isError,
                                                            revealLabel: copy.revealLabel,
                                                            hideLabel: copy.hideLabel,
                                                        }}
                                                        on={{ change: (value) => { values.current.password = value } }}
                                                    />
                                                )),
                                                ...(status === undefined ? [] : [status]),
                                                defineLeafComponent("button", {}, () => (
                                                    <Button
                                                        props={{
                                                            label: copy.submitLabel,
                                                            variant: "primary",
                                                            type: "submit",
                                                            disabled: copy.isPending,
                                                            isPending: copy.isPending,
                                                        }}
                                                    />
                                                )),
                                            ],
                                        })}
                                    />
                                </form>
                            </>
                        )),
                    }),
                    // BOTH ends, because the contract's reason is that a choice and the way out of
                    // it sit at opposite ends of one line. Filling only one slot leaves
                    // `justify-between` describing nothing and makes the `why` a label rather than
                    // a reason.
                    defineContractComponent("spread-choice-row", {
                        choice: defineLeafComponent("text-link", { size: "sm" }, () => (
                            <TextLink props={{ label: copy.forgotPasswordLabel, size: "sm" }} on={{ press: input.on?.forgotPassword }} />
                        )),
                        exit: defineLeafComponent("text-link", { size: "sm" }, () => (
                            <TextLink props={{ label: copy.signUpLabel, size: "sm" }} on={{ press: input.on?.signUp }} />
                        )),
                    }),
                ],
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "block", world: "pure" } as const
