import { useRef, useState, type SubmitEvent } from "react";
import { Checkbox, nivoIconSource } from "@nivo/ui";
import { Button, Divider, Heading, Icon, Input, OtpInput, Progress, Text, TextAction, type IconSourceProps } from "@starci/grammar/common";
import {
  AUTH_PANEL_CLASS_NAME,
  AUTH_PANEL_DETAILS_CLASS_NAME,
  AUTH_PANEL_FORM_CLASS_NAME,
  AUTH_PANEL_NOTICE_ACTIONS_CLASS_NAME,
  AUTH_PANEL_NOTICE_CLASS_NAME,
  AUTH_PANEL_OPTIONS_CLASS_NAME,
  AUTH_PANEL_OTP_FIELD_CLASS_NAME,
  AUTH_PANEL_PROVIDER_CLASS_NAME,
  AUTH_PANEL_TEXT_ACTIONS_CLASS_NAME
} from "./classNames";

/**
 * BLOCK - `AuthenticationPanel`: one surface, three journeys, the steps each of them takes.
 *
 * TARGET PATH: `apps/app/src/components/blocks/auth/AuthenticationPanel/index.tsx`.
 *
 * ONE PANEL RATHER THAN THREE, and that is the whole shape of revision 1.2. The named reference is
 * one route - `/authentication` - whose panel switches mode in place, and the three separate panels
 * this case shipped in 1.0 and 1.1 were the thing that made it not that. Merging them also retires
 * `OtpStep`: it existed because two panels each needed a code step and a sixty-second cooldown, and
 * with one panel there is only ever one of each.
 *
 * THE STEP IS THE STATE, AND THE MODE IS NOT. `details`, `code`, `secondFactor` and `done` each
 * draw a DIFFERENT tree - a form of two or four boxes, a six-slot code with an optional password
 * pair, a six-slot code alone, a confirmation - so they are states. Which journey is running
 * changes which words and which fields appear inside the same tree, so it is props. `isPending`
 * is props for the same reason. `restoring` is a state because while it holds the surface owes the
 * reader only a wait, and drawing a sign-in form under it would offer controls that cannot be
 * honoured yet.
 *
 * SIGNING IN DOES NOT PASS THROUGH `code`. `signIn` exchanges a password for a session in one
 * request; an account owing TOTP lands on `secondFactor`, which is neither a refusal nor a
 * session - and reusing the refusal sentence would tell those readers their password was wrong.
 * `twoFactorUnsupported` remains in the union so a build whose session layer cannot complete the
 * challenge can still say so honestly rather than dead-ending on a form that cannot submit.
 *
 * THE ORDER IS THE DESIGN. The shortcuts come FIRST because many readers take one and never reach
 * the form; the divider NAMES the choice between them rather than merely separating them; the form
 * follows; and the way to the other journey is the last line, phrased as a question and its
 * answer - which is what makes one road the main one and the rest alternatives.
 *
 * WHAT THIS BLOCK DOES NOT DRAW: the page heading, the way to the other journey and the way back
 * from a challenge. The accepted direction puts the heading ABOVE one surface and the exits BELOW
 * it, on the page rather than inside the card, so those three travel to the host as copy (`title`,
 * `subtitle`) and as `AuthActions` (`changeMode`, `back`) and the host draws them. Everything this
 * block returns is surface content: the shortcuts, the fields, the code, the cooldown, the final
 * action and the settled notices.
 *
 * THE RESET JOURNEY MUST NEVER SAY WHETHER AN ADDRESS IS REGISTERED. `forgotPasswordInit` answers
 * an unknown address with the same flag, sentence, lifetime and mailed code as a known one, so the
 * code step's lead is phrased as a CONDITION for that mode and as a fact for the others, and one
 * refusal sentence covers both ways its second step can fail.
 *
 * THE VALUES ARE UNCONTROLLED, held in a ref. A form that re-renders on every keystroke drops
 * characters on a slow phone, and nothing here needs to see a half-typed address.
 */

/** Which journey the reader is on. */
export type AuthMode = "signIn" | "signUp" | "forgotPassword";

/** The identity providers this product signs in with. */
export type AuthProvider = "google" | "github";

/** Which tree the panel draws. */
export type AuthState = /** The shortcuts and the credential form. */
"details"
/** The mailed code, and on the reset journey the new password pair beside it. */ | "code"
/** The authenticator code, on the sign-in journey that owes one. */ | "secondFactor"
/** The journey finished. */ | "done"
/** A stored sign-in is being verified; no control is owed yet. */ | "restoring"
/** The account holds a second factor this build cannot complete. Sign-in only. */ | "twoFactorUnsupported"
/**
 * Something was settled WITHOUT a session, and there is nothing left to type.
 *
 * The three endings that land here are the proven-holder notice, a provider identity with no
 * verified email and a destination the reader asked for that could not be reached. Each offers up
 * to two ways onward and none of them offers a field, which is why they share one tree rather than
 * borrowing `details`: a form under any of them would invite an entry that cannot change anything.
 */ | "notice";

/** The exact control whose action is currently running. */
export type AuthPendingAction = "provider" | "submit" | "resend";

/** What the reader hands over at the first step. */
export type AuthDetails = {
  /** The address. */
  readonly email: string;
  /** The secret, whichever journey names it. `""` on the reset journey, which asks for none. */
  readonly password: string;
  /** The display name. `""` unless the registration journey collected one. */
  readonly name: string;
};

/** What the reader hands over at the mailed-code step. */
export type AuthCode = {
  /** The one-time code from their inbox. */
  readonly otp: string;
  /** The password to set. `""` on the journey that sets none. */
  readonly newPassword: string;
};

/** What the reader hands over at the second-factor step. */
export type AuthFactor = {
  /** The current code from the authenticator app. */
  readonly code: string;
};

/** Copy and situation shared by every tree here. Already resolved - a block never translates. */
export type AuthFrame = {
  /**
   * What the surface is called while this journey is on screen.
   *
   * DRAWN OUTSIDE THE PANEL, by the host page, because the direction puts the page heading above
   * the surface rather than inside it. It travels through here anyway so every state answers what
   * it is called, and the host never has to learn a journey to caption one.
   */
  readonly title: string;
  /** The line under the title, saying what the reader is here to do. */
  readonly subtitle: string;
  /** The one sentence that goes with whatever is happening, or `""` when nothing is. */
  readonly statusMessage: string;
  /** Whether that sentence is a refusal, so it is announced rather than merely shown. */
  readonly isError: boolean;
  /** A request is already on its way, so every control refuses a second press. */
  readonly isPending: boolean;
  /** The exact action that owns the pending indicator. */
  readonly pendingAction?: AuthPendingAction;
  /**
   * Which provider button owns the wait while `pendingAction` is `provider`.
   *
   * `undefined` means a provider exchange is in flight but the button that started it is gone -
   * the page left and came back - so both shortcut buttons stay disabled without either claiming
   * the wait.
   */
  readonly pendingProvider?: AuthProvider;
};

/** Copy for the first step. */
export type AuthDetailsCopy = AuthFrame & {
  /** Which journey is running. It selects which fields appear, not which tree. */
  readonly mode: AuthMode;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly emailRequired: string;
  readonly emailInvalid: string;
  /** Said only on the reset journey: the code goes to the address AS TYPED. */
  readonly emailHint: string;
  readonly passwordLabel: string;
  readonly passwordPlaceholder: string;
  readonly passwordRequired: string;
  readonly passwordTooShort: string;
  /** The backend's own rule, said before it is broken rather than as a refusal after. */
  readonly passwordHint: string;
  readonly confirmPasswordLabel: string;
  readonly confirmPasswordPlaceholder: string;
  readonly confirmPasswordRequired: string;
  /** What the second box says when it does not match the first. */
  readonly confirmPasswordMismatch: string;
  /** The display name is the only optional field, so it is the only one that says so. */
  readonly nameLabel: string;
  readonly namePlaceholder: string;
  readonly nameHint: string;
  /** The backend's own limit, said when it is crossed rather than as a refusal after. */
  readonly nameTooLong: string;
  /**
   * The authority sentence, said on the registration journey: an account signs the reader in and
   * grants nothing by itself, so nobody creates one expecting workspace or purchase rights.
   */
  readonly authorityHint: string;
  readonly revealLabel: string;
  readonly hideLabel: string;
  readonly submitLabel: string;
  readonly orLabel: string;
  readonly googleLabel: string;
  readonly githubLabel: string;
  readonly forgotPasswordLabel: string;
  /** What the remembering switch is called. Sign-in only. */
  readonly rememberMeLabel: string;
  /** Whether it is on. */
  readonly isRememberMe: boolean;
};

/** Copy for the mailed-code step. */
export type AuthCodeCopy = AuthFrame & {
  /** Which journey is running: the reset one also sets a password here. */
  readonly mode: AuthMode;
  readonly codeLabel: string;
  readonly codeRequired: string;
  readonly codeInvalid: string;
  /** How long the code lasts, in words. */
  readonly codeHint: string;
  readonly newPasswordLabel: string;
  readonly newPasswordPlaceholder: string;
  readonly newPasswordRequired: string;
  readonly newPasswordTooShort: string;
  readonly newPasswordHint: string;
  readonly confirmNewPasswordLabel: string;
  readonly confirmNewPasswordPlaceholder: string;
  readonly confirmNewPasswordRequired: string;
  /** What the repeat box says when it does not match the new password. */
  readonly confirmNewPasswordMismatch: string;
  readonly revealLabel: string;
  readonly hideLabel: string;
  readonly submitLabel: string;
  readonly resendLabel: string;
  /**
   * What the resend says while it refuses, already carrying the seconds.
   *
   * `""` means the cooldown has passed and {@link resendLabel} is shown instead. The panel does not
   * count: the page owns the clock, because the page is also what knows a code was just sent.
   */
  readonly cooldownLabel: string;
  /** The way back to the first step. Drawn by the host page, below the surface. */
  readonly backLabel: string;
};

/** Copy for the second-factor step: the same six slots, nothing mailed, no resend. */
export type AuthFactorCopy = AuthFrame & {
  readonly codeLabel: string;
  readonly codeRequired: string;
  readonly codeInvalid: string;
  readonly submitLabel: string;
  /** The way back to the first step. Drawn by the host page, below the surface. */
  readonly backLabel: string;
};

/** Copy for the restoring tree: no form, only a wait with a name. */
export type AuthRestoringCopy = {
  readonly title: string;
  readonly subtitle: string;
  /** The accessible name of the wait indicator and the words under it. */
  readonly progressLabel: string;
};

/**
 * Copy for a tree that says one thing and offers up to two ways onward.
 *
 * THE SECOND WAY IS A LABEL, NOT A SECOND SUBTREE. The proven-holder notice offers signing in or
 * resetting the password, and a provider identity with no verified email offers registering or
 * signing in - so the shape needs two actions. Which journey each one starts is the host page's
 * business, which is why the labels are here and the destinations are not.
 */
export type AuthNoticeCopy = AuthFrame & {
  readonly doneTitle: string;
  readonly doneHint: string;
  readonly onwardLabel: string;
  /** The second way onward, or `""` when this ending offers only one. */
  readonly secondaryLabel: string;
};

/** What the panel can do. */
export type AuthActions = {
  /** Leave for a provider. */
  readonly chooseProvider?: (provider: AuthProvider) => void;
  /** Submit the first step. */
  readonly submitDetails?: (details: AuthDetails) => void;
  /** Submit the mailed-code step. */
  readonly submitCode?: (code: AuthCode) => void;
  /** Submit the second-factor step. */
  readonly submitFactor?: (factor: AuthFactor) => void;
  /** Ask for another code. */
  readonly resend?: () => void;
  /** Abandon the challenge and go back to the first step. */
  readonly back?: () => void;
  /** Switch journey. */
  readonly changeMode?: (mode: AuthMode) => void;
  /** Turn the remembering switch on or off. */
  readonly changeRememberMe?: (isRemembered: boolean) => void;
  /** Go on to whatever the journey opened. */
  readonly onward?: () => void;
  /** Take the second way out of a settled notice. */
  readonly onwardSecondary?: () => void;
};

/**
 * Props for {@link AuthenticationPanel}, discriminated by the step.
 *
 * A union per state, so the copy of a tree the panel is NOT drawing cannot be passed and the copy of
 * the one it IS drawing cannot be forgotten.
 */
type StateBlockProps<State extends AuthState, Data> = {
  readonly state: State;
  readonly props: Data;
};

/** Public AuthenticationPanelProps declaration. */
export type AuthenticationPanelProps = (StateBlockProps<"details", AuthDetailsCopy> & {
  readonly on?: AuthActions;
}) | (StateBlockProps<"code", AuthCodeCopy> & {
  readonly on?: AuthActions;
}) | (StateBlockProps<"secondFactor", AuthFactorCopy> & {
  readonly on?: AuthActions;
}) | (StateBlockProps<"done", AuthNoticeCopy> & {
  readonly on?: AuthActions;
}) | (StateBlockProps<"restoring", AuthRestoringCopy> & {
  readonly on?: AuthActions;
}) | (StateBlockProps<"twoFactorUnsupported", AuthNoticeCopy> & {
  readonly on?: AuthActions;
}) | (StateBlockProps<"notice", AuthNoticeCopy> & {
  readonly on?: AuthActions;
});

/** Field ids, so every label reaches the box it names. */
const EMAIL_ID = "authentication-email";
const PASSWORD_ID = "authentication-password";
const CONFIRM_ID = "authentication-confirm-password";
const NAME_ID = "authentication-name";
const CODE_ID = "authentication-code";
const CODE_STATUS_ID = "authentication-code-status";
const NEW_PASSWORD_ID = "authentication-new-password";
const CONFIRM_NEW_PASSWORD_ID = "authentication-confirm-new-password";

type AuthFieldName = "email" | "password" | "confirmPassword" | "name" | "otp" | "newPassword" | "confirmNewPassword";
type AuthFieldErrors = Partial<Record<AuthFieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINIMUM_PASSWORD_LENGTH = 8;
/** The backend's own limit on the optional display name, `SignUpInitInput.name`'s `MaxLength`. */
const MAXIMUM_NAME_LENGTH = 120;

/** What the form starts with. */
const EMPTY = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  otp: "",
  newPassword: "",
  confirmNewPassword: ""
};

/** The two provider shortcuts, in the order the direction draws them. */
const PROVIDERS: ReadonlyArray<{
  readonly provider: AuthProvider;
  readonly icon: "google" | "github";
}> = [{
  provider: "google",
  icon: "google"
}, {
  provider: "github",
  icon: "github"
}];

/**
 * The refusal mark the direction draws ahead of a refused-code sentence: a circle carrying an
 * exclamation, stroked in `currentColor` so the field's accent tone owns the paint. The shared
 * name-to-glyph registry lives outside this block, so this glyph stays local and still crosses
 * Grammar's `Icon` boundary like every other app-owned source.
 */
const RefusalGlyph = (props: IconSourceProps) => <svg
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  {...props}>
    <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth={1.5} />
    <path stroke="currentColor" strokeLinecap="round" strokeWidth={1.5} d="M8 4.75v3.5" />
    <circle cx="8" cy="11.25" r="1" fill="currentColor" />
  </svg>;

/** What the labelled six-slot code field needs. */
type OtpFieldProps = {
  /** The input's id. */
  readonly id: string;
  /** The visible label. `OtpInput` draws it and names the slot group and the real input with it. */
  readonly label: string;
  /** The id the hint-or-refusal line wears. */
  readonly statusId: string;
  /** The hint, or the refusal when the field is in error. */
  readonly message: string;
  /** Whether `message` is a refusal. */
  readonly isError: boolean;
  /** Whether the field refuses input. */
  readonly isPending: boolean;
  /** Called with the current digits on every change. */
  readonly onValue: (value: string) => void;
};

/**
 * The six-slot code field: the digits, and the one line that explains or refuses them.
 *
 * THE VISIBLE NAME IS `OtpInput`'s OWN. Grammar 0.5.0 takes a `label` and draws it as the slots'
 * `<label for>`, naming the group and the single real input - so the field is named ONCE, by the
 * control that owns the slots, and a second `Label` beside it would announce the same words twice
 * and leave the group unnamed. Only the status line is app-owned, and `describedBy` hands its id
 * to the input so the refusal is read with the code it is about.
 *
 * @param props - {@link OtpFieldProps}
 * @returns The labelled code field.
 */
const OtpField = (props: OtpFieldProps) => <div className={AUTH_PANEL_OTP_FIELD_CLASS_NAME}>
    <OtpInput
      id={props.id}
      name="otp"
      label={props.label}
      disabled={props.isPending}
      invalid={props.isError}
      describedBy={props.statusId}
      onChange={props.onValue}
    />
    {/*
      * A refusal is not a hint: the accent tone and the leading mark make the line read as a
      * refusal without relying on colour alone, and `assertive` keeps it announced.
      */}
    <Text
      id={props.statusId}
      size="sm"
      tone={props.isError ? "accent" : "muted"}
      live={props.isError ? "assertive" : "polite"}
      startContent={props.isError ? <Icon source={RefusalGlyph} usage="chip" /> : undefined}
    >{props.message}</Text>
  </div>;

/**
 * Draw the authentication panel.
 *
 * @param props - {@link AuthenticationPanelProps}
 */
export const AuthenticationPanel = (props: AuthenticationPanelProps) => {
  const values = useRef({
    ...EMPTY
  });
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const clearFieldError = (field: AuthFieldName) => {
    setFieldErrors(current => current[field] === undefined ? current : {
      ...current,
      [field]: undefined
    });
  };

  /*
   * NO HEADING IS DRAWN HERE. The direction puts the page heading ABOVE the surface and outside
   * it, so the host page owns both the title and the line under it - `props.props.title` and
   * `.subtitle` travel with every state for exactly that host to read. A second Heading inside the
   * surface would caption the card with the page's own words and skip the outline level.
   */
  if (props.state === "restoring") {
    return <div className={AUTH_PANEL_CLASS_NAME}><div className={AUTH_PANEL_NOTICE_CLASS_NAME}>
      <Progress label={props.props.progressLabel} isSkeleton />
      <Text size="sm" tone="muted" live="polite">{props.props.progressLabel}</Text></div></div>;
  }
  if (props.state === "done" || props.state === "twoFactorUnsupported" || props.state === "notice") {
    return <div className={AUTH_PANEL_CLASS_NAME}><div className={AUTH_PANEL_NOTICE_CLASS_NAME}>{undefined}

          {props.props.doneTitle === "" ? [] : [<Heading key="notice-title" level={2}>{props.props.doneTitle}</Heading>]}


          <Text size="sm" tone="muted">{props.props.doneHint}</Text></div><div className={AUTH_PANEL_NOTICE_ACTIONS_CLASS_NAME}><>{props.props.statusMessage === "" ? [] : [<Text key="status" size="sm" tone={props.props.isError ? "accent" : "muted"} live={props.props.isError ? "assertive" : "polite"}>{props.props.statusMessage}</Text>]}

            <Button
              variant="primary"
              width="fill"
              onPress={props.on?.onward}
            >{props.props.onwardLabel}</Button>
            {props.props.secondaryLabel === "" ? [] : [<TextAction key="secondary" onPress={props.on?.onwardSecondary}>{props.props.secondaryLabel}</TextAction>]}</></div></div>;
  }
  if (props.state === "secondFactor") {
    const copy = props.props;
    const submitFactor = (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextErrors: AuthFieldErrors = {};
      if (values.current.otp.trim() === "") nextErrors.otp = copy.codeRequired;
      else if (!/^\d{6}$/.test(values.current.otp.trim())) nextErrors.otp = copy.codeInvalid;
      setFieldErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
      props.on?.submitFactor?.({
        code: values.current.otp.trim()
      });
    };
    return <div className={AUTH_PANEL_CLASS_NAME}><form onSubmit={submitFactor}>
      <div className={AUTH_PANEL_FORM_CLASS_NAME}><OtpField
        id={CODE_ID}
        label={copy.codeLabel}
        statusId={CODE_STATUS_ID}
        message={fieldErrors.otp ?? (copy.statusMessage === "" ? "" : copy.statusMessage)}
        isError={fieldErrors.otp !== undefined || copy.isError}
        isPending={copy.isPending}
        onValue={value => {
          values.current.otp = value;
          clearFieldError("otp");
        }}
      /><Button
        variant="primary"
        type="submit"
        width="fill"
        isDisabled={copy.isPending}
        isPending={copy.pendingAction === "submit"}
      >{copy.submitLabel}</Button></div></form></div>;
  }
  /** The one sentence, announced when it is a refusal and merely shown when it is not. */
  const status = props.props.statusMessage === "" ? undefined : <Text key="status" size="sm" tone="muted" live={props.props.isError ? "assertive" : "polite"}>{props.props.statusMessage}</Text>;
  if (props.state === "code") {
    const copy = props.props;
    const setsPassword = copy.mode === "forgotPassword";
    const submitCode = (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nextErrors: AuthFieldErrors = {};
      if (values.current.otp.trim() === "") nextErrors.otp = copy.codeRequired;
      else if (!/^\d{6}$/.test(values.current.otp.trim())) nextErrors.otp = copy.codeInvalid;
      if (setsPassword && values.current.newPassword === "") nextErrors.newPassword = copy.newPasswordRequired;
      else if (setsPassword && values.current.newPassword.length < MINIMUM_PASSWORD_LENGTH) nextErrors.newPassword = copy.newPasswordTooShort;
      if (setsPassword && values.current.confirmNewPassword === "") nextErrors.confirmNewPassword = copy.confirmNewPasswordRequired;
      else if (setsPassword && values.current.newPassword !== values.current.confirmNewPassword) nextErrors.confirmNewPassword = copy.confirmNewPasswordMismatch;
      setFieldErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
      props.on?.submitCode?.({
        otp: values.current.otp.trim(),
        newPassword: values.current.newPassword
      });
    };
    // Only the reset journey spends its code and sets a password in one request, which is what
    // `forgotPasswordVerifyOtp` takes.
    const isCoolingDown = copy.cooldownLabel !== "";
    return <div className={AUTH_PANEL_CLASS_NAME}>
        <form onSubmit={submitCode}>
                                <div className={AUTH_PANEL_FORM_CLASS_NAME}>{[<OtpField
                                  key="code"
                                  id={CODE_ID}
                                  label={copy.codeLabel}
                                  statusId={CODE_STATUS_ID}
                                  message={fieldErrors.otp ?? (copy.isError && copy.statusMessage !== "" ? copy.statusMessage : copy.codeHint)}
                                  isError={fieldErrors.otp !== undefined || copy.isError}
                                  isPending={copy.isPending}
                                  onValue={value => {
                values.current.otp = value;
                clearFieldError("otp");
              }}
                                />, ...(!setsPassword ? [] : [<Input
              key="new-password"
              id={NEW_PASSWORD_ID}
              name="newPassword"
              variant="primary"
              kind="newPassword"
              label={copy.newPasswordLabel}
              placeholder={copy.newPasswordPlaceholder}
              revealLabel={copy.revealLabel}
              hideLabel={copy.hideLabel}
              isDisabled={copy.isPending}
              hint={fieldErrors.newPassword !== undefined ? undefined : fieldErrors.newPassword ?? copy.newPasswordHint}
              errorMessage={fieldErrors.newPassword !== undefined ? fieldErrors.newPassword ?? copy.newPasswordHint : undefined}
              isError={fieldErrors.newPassword !== undefined}
              onValueChange={value => {
                values.current.newPassword = value;
                clearFieldError("newPassword");
                clearFieldError("confirmNewPassword");
              }}
            />, <Input
              key="confirm-new-password"
              id={CONFIRM_NEW_PASSWORD_ID}
              name="confirmNewPassword"
              variant="primary"
              kind="newPassword"
              label={copy.confirmNewPasswordLabel}
              placeholder={copy.confirmNewPasswordPlaceholder}
              revealLabel={copy.revealLabel}
              hideLabel={copy.hideLabel}
              isDisabled={copy.isPending}
              hint={fieldErrors.confirmNewPassword !== undefined ? undefined : fieldErrors.confirmNewPassword}
              errorMessage={fieldErrors.confirmNewPassword !== undefined ? fieldErrors.confirmNewPassword : undefined}
              isError={fieldErrors.confirmNewPassword !== undefined}
              onValueChange={value => {
                values.current.confirmNewPassword = value;
                clearFieldError("confirmNewPassword");
              }}
            />]), ...(status === undefined || copy.isError ? [] : [status]),
          /*
           * THE COOLDOWN IS DRAWN BEFORE THE FINAL ACTION, in the direction's own order: what the
           * reader may do about the code, then the one action that spends it. `TextAction` renders
           * `type="button"`, so asking for another code cannot submit the form it sits in.
           */
          <div key="resend" className={AUTH_PANEL_TEXT_ACTIONS_CLASS_NAME}>
            <TextAction size="sm" onPress={isCoolingDown || copy.isPending ? undefined : props.on?.resend}>
              {isCoolingDown ? copy.cooldownLabel : copy.resendLabel}
            </TextAction></div>, <Button
              key="submit"
              variant="primary"
              type="submit"
              width="fill"
              isDisabled={copy.isPending}
              isPending={copy.pendingAction === "submit"}
            >{copy.submitLabel}</Button>]}</div>



          
          
                            </form></div>;
  }
  const copy = props.props;
  const isSignUp = copy.mode === "signUp";
  const isReset = copy.mode === "forgotPassword";
  const submitDetails = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: AuthFieldErrors = {};
    const email = values.current.email.trim();
    const name = values.current.name.trim();
    if (email === "") nextErrors.email = copy.emailRequired;
    else if (!EMAIL_PATTERN.test(email)) nextErrors.email = copy.emailInvalid;
    if (!isReset && values.current.password === "") nextErrors.password = copy.passwordRequired;
    else if (!isReset && values.current.password.length < MINIMUM_PASSWORD_LENGTH) nextErrors.password = copy.passwordTooShort;
    if (isSignUp && values.current.confirmPassword === "") nextErrors.confirmPassword = copy.confirmPasswordRequired;
    else if (isSignUp && values.current.password !== values.current.confirmPassword) nextErrors.confirmPassword = copy.confirmPasswordMismatch;
    if (isSignUp && name.length > MAXIMUM_NAME_LENGTH) nextErrors.name = copy.nameTooLong;
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    props.on?.submitDetails?.({
      email,
      password: values.current.password,
      name
    });
  };
  const credentialFields = [<Input
    key="email"
    id={EMAIL_ID}
    name="email"
    variant="primary"
    kind="email"
    label={copy.emailLabel}
    placeholder={copy.emailPlaceholder}
    isDisabled={copy.isPending}
    hint={fieldErrors.email !== undefined ? undefined : fieldErrors.email ?? (isReset ? copy.emailHint : undefined)}
    errorMessage={fieldErrors.email !== undefined ? fieldErrors.email ?? (isReset ? copy.emailHint : undefined) : undefined}
    isError={fieldErrors.email !== undefined}
    onValueChange={value => {
      values.current.email = value;
      clearFieldError("email");
    }}
  />,
  // The reset journey asks for NO password: it proves the inbox first and sets one at step two.
  ...(isReset ? [] : [<Input
    key="password"
    id={PASSWORD_ID}
    name="password"
    variant="primary"
    kind={isSignUp ? "newPassword" : "password"}
    label={copy.passwordLabel}
    placeholder={copy.passwordPlaceholder}
    revealLabel={copy.revealLabel}
    hideLabel={copy.hideLabel}
    isDisabled={copy.isPending}
    hint={fieldErrors.password !== undefined ? undefined : fieldErrors.password ?? (isSignUp ? copy.passwordHint : undefined)}
    errorMessage={fieldErrors.password !== undefined ? fieldErrors.password ?? (isSignUp ? copy.passwordHint : undefined) : undefined}
    isError={fieldErrors.password !== undefined}
    onValueChange={value => {
      values.current.password = value;
      clearFieldError("password");
      clearFieldError("confirmPassword");
    }}
  />]), ...(!isSignUp ? [] : [<Input
    key="confirm-password"
    id={CONFIRM_ID}
    name="confirmPassword"
    variant="primary"
    kind="newPassword"
    label={copy.confirmPasswordLabel}
    placeholder={copy.confirmPasswordPlaceholder}
    revealLabel={copy.revealLabel}
    hideLabel={copy.hideLabel}
    isDisabled={copy.isPending}
    hint={fieldErrors.confirmPassword !== undefined ? undefined : fieldErrors.confirmPassword}
    errorMessage={fieldErrors.confirmPassword !== undefined ? fieldErrors.confirmPassword : undefined}
    isError={fieldErrors.confirmPassword !== undefined}
    onValueChange={value => {
      values.current.confirmPassword = value;
      clearFieldError("confirmPassword");
    }}
  />, <Input
    key="name"
    id={NAME_ID}
    name="name"
    variant="primary"
    kind="text"
    label={copy.nameLabel}
    placeholder={copy.namePlaceholder}
    isDisabled={copy.isPending}
    hint={fieldErrors.name !== undefined ? undefined : fieldErrors.name ?? copy.nameHint}
    errorMessage={fieldErrors.name !== undefined ? fieldErrors.name ?? copy.nameHint : undefined}
    isError={fieldErrors.name !== undefined}
    onValueChange={value => {
      values.current.name = value;
      clearFieldError("name");
    }}
  />, <Text key="authority-hint" size="sm" tone="muted">{copy.authorityHint}</Text>])];
  const credentialActions = [
  /*
   * BOTH ENDS FILLED, which is what `justify-between` is describing: a choice the reader makes
   * about this sign-in, and the way out of it. Only signing in has either.
   *
   * WHAT REMEMBER-ME CURRENTLY DOES, said plainly because the control implies more than it
   * delivers: the refresh cookie's `maxAge` is a fixed thirty days with no per-request control,
   * so the switch records the reader's intent and the session lasts the same either way. Making
   * it mean something is a backend change - the cookie has to take a lifetime from this flag -
   * and it is recorded as an enabler rather than faked here.
   */
  ...(copy.mode !== "signIn" ? [] : [<div key="options" className={AUTH_PANEL_OPTIONS_CLASS_NAME}>


    <Checkbox props={{
      label: copy.rememberMeLabel,
      isSelected: copy.isRememberMe,
      name: "rememberMe"
    }} on={{
      change: isRemembered => props.on?.changeRememberMe?.(isRemembered)
    }} />


    <TextAction size="sm" onPress={() => props.on?.changeMode?.("forgotPassword")}>{copy.forgotPasswordLabel}</TextAction></div>]), ...(status === undefined ? [] : [status]), <Button
      key="submit"
      variant="primary"
      type="submit"
      width="fill"
      isDisabled={copy.isPending}
      isPending={copy.pendingAction === "submit"}
    >{copy.submitLabel}</Button>];
  return <div className={AUTH_PANEL_CLASS_NAME}><div className={AUTH_PANEL_DETAILS_CLASS_NAME}><div className={AUTH_PANEL_PROVIDER_CLASS_NAME}>{PROVIDERS.map(entry => <Button
            key={entry.provider}
            variant="outline"
            width="fill"
            isDisabled={copy.isPending}
            isPending={copy.pendingAction === "provider" && copy.pendingProvider === entry.provider}
            onPress={() => props.on?.chooseProvider?.(entry.provider)}
            startContent={<Icon source={nivoIconSource(entry.icon, "chip")} usage="chip" />}
          >{entry.provider === "google" ? copy.googleLabel : copy.githubLabel}</Button>)}

          <Divider label={copy.orLabel} /></div>


        <form onSubmit={submitDetails}>
                                <div className={AUTH_PANEL_FORM_CLASS_NAME}>{credentialFields}{credentialActions}</div>
          
                            </form></div></div>;
};
