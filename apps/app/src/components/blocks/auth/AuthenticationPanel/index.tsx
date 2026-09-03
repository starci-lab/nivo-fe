import { useRef, useState, type SubmitEvent } from "react";
import { Checkbox, nivoIconSource } from "@nivo/ui";
import { Button, Input, Heading, Icon, Text, TextAction, Divider } from "@starci/grammar/core";
import {
  AUTH_PANEL_CLASS_NAME,
  AUTH_PANEL_DETAILS_CLASS_NAME,
  AUTH_PANEL_FOOTER_CLASS_NAME,
  AUTH_PANEL_FORM_CLASS_NAME,
  AUTH_PANEL_HEADER_CLASS_NAME,
  AUTH_PANEL_NOTICE_ACTIONS_CLASS_NAME,
  AUTH_PANEL_NOTICE_CLASS_NAME,
  AUTH_PANEL_OPTIONS_CLASS_NAME,
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
 * THE STEP IS THE STATE, AND THE MODE IS NOT. `details`, `code` and `done` each draw a DIFFERENT tree
 * - a form of two or three boxes, a form of one or two, a confirmation - so they are states. Which
 * journey is running changes which words and which fields appear inside the same tree, so it is
 * props. `isPending` is props for the same reason.
 *
 * SIGNING IN DOES NOT PASS THROUGH `code`, and this is where nivo genuinely differs from the
 * reference rather than by choice. `signIn` exchanges a password for a session in one request; the
 * reference's backend mails a code for every journey. So `signIn` runs `details -> done`, and an
 * account owing TOTP lands on `twoFactorUnsupported` instead - a challenge is neither a refusal nor a
 * session, and reusing the refusal sentence would tell those readers their password was wrong.
 *
 * THE ORDER IS THE DESIGN. The shortcut comes FIRST because many readers take it and never reach the
 * form; the divider NAMES the choice between them rather than merely separating them; the form
 * follows; and the way to the other journey is the last line, phrased as a question and its answer -
 * which is what makes one road the main one and the rest alternatives.
 *
 * THE RESET JOURNEY MUST NEVER SAY WHETHER AN ADDRESS IS REGISTERED. `forgotPasswordInit` answers an
 * unknown address with the same flag, sentence, lifetime and mailed code as a known one, so the code
 * step's lead is phrased as a CONDITION for that mode and as a fact for the others, and one refusal
 * sentence covers both ways its second step can fail.
 *
 * THE VALUES ARE UNCONTROLLED, held in a ref. A form that re-renders on every keystroke drops
 * characters on a slow phone, and nothing here needs to see a half-typed address.
 */

/** Which journey the reader is on. */
export type AuthMode = "signIn" | "signUp" | "forgotPassword";

/** The identity provider this product signs in with. */
export type AuthProvider = "google";

/** Which tree the panel draws. */
export type AuthState = /** The shortcut and the credential form. */
"details"
/** The mailed code, and on the reset journey the new password beside it. */ | "code"
/** The journey finished. */ | "done"
/** The account holds a second factor this build cannot complete. Sign-in only. */ | "twoFactorUnsupported";

/** The exact control whose action is currently running. */
export type AuthPendingAction = "provider" | "submit" | "resend";

/** What the reader hands over at the first step. */
export type AuthDetails = {
  /** The address. */
  readonly email: string;
  /** The secret, whichever journey names it. `""` on the reset journey, which asks for none. */
  readonly password: string;
};

/** What the reader hands over at the second step. */
export type AuthCode = {
  /** The one-time code from their inbox. */
  readonly otp: string;
  /** The password to set. `""` on the journey that sets none. */
  readonly newPassword: string;
};

/** Copy and situation shared by every tree here. Already resolved - a block never translates. */
export type AuthFrame = {
  /** What the surface is called while this journey is on screen. */
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
  readonly revealLabel: string;
  readonly hideLabel: string;
  readonly submitLabel: string;
  readonly orLabel: string;
  readonly googleLabel: string;
  readonly forgotPasswordLabel: string;
  /** What the remembering switch is called. Sign-in only. */
  readonly rememberMeLabel: string;
  /** Whether it is on. */
  readonly isRememberMe: boolean;
  /** The last line: a question, and the answer that switches journey. */
  readonly promptQuestion: string;
  readonly promptAction: string;
};

/** Copy for the second step. */
export type AuthCodeCopy = AuthFrame & {
  /** Which journey is running: the reset one also sets a password here. */
  readonly mode: AuthMode;
  readonly codeLabel: string;
  readonly codePlaceholder: string;
  readonly codeRequired: string;
  readonly codeInvalid: string;
  /** How long the code lasts, in words. */
  readonly codeHint: string;
  readonly newPasswordLabel: string;
  readonly newPasswordPlaceholder: string;
  readonly newPasswordRequired: string;
  readonly newPasswordTooShort: string;
  readonly newPasswordHint: string;
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
  /** The way back to the first step. */
  readonly backLabel: string;
};

/** Copy for a tree that says one thing and offers one way onward. */
export type AuthNoticeCopy = AuthFrame & {
  readonly doneTitle: string;
  readonly doneHint: string;
  readonly onwardLabel: string;
};

/** What the panel can do. */
export type AuthActions = {
  /** Leave for a provider. */
  readonly chooseProvider?: (provider: AuthProvider) => void;
  /** Submit the first step. */
  readonly submitDetails?: (details: AuthDetails) => void;
  /** Submit the second step. */
  readonly submitCode?: (code: AuthCode) => void;
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
}) | (StateBlockProps<"done", AuthNoticeCopy> & {
  readonly on?: AuthActions;
}) | (StateBlockProps<"twoFactorUnsupported", AuthNoticeCopy> & {
  readonly on?: AuthActions;
});

/** Field ids, so every label reaches the box it names. */
const EMAIL_ID = "authentication-email";
const PASSWORD_ID = "authentication-password";
const CONFIRM_ID = "authentication-confirm-password";
const CODE_ID = "authentication-code";
const NEW_PASSWORD_ID = "authentication-new-password";

type AuthFieldName = "email" | "password" | "confirmPassword" | "otp" | "newPassword";
type AuthFieldErrors = Partial<Record<AuthFieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MINIMUM_PASSWORD_LENGTH = 8;

/** What the form starts with. */
const EMPTY = {
  email: "",
  password: "",
  confirmPassword: "",
  otp: "",
  newPassword: ""
};

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
   * `mark` IS NAMED AND LEFT EMPTY, which is not the same as leaving it out. A concurrent change
   * gave the title pair an optional glyph slot. Saying `undefined` states the design decision out
   * loud: this surface has no glyph above its name.
   */
  const header = <div className={AUTH_PANEL_HEADER_CLASS_NAME}>{undefined}

    <Heading level={2}>{props.props.title}</Heading>


    <Text size="sm" tone="muted">{props.props.subtitle}</Text></div>;

  /** The one sentence, announced when it is a refusal and merely shown when it is not. */
  const status = props.props.statusMessage === "" ? undefined : <Text size="sm" tone="muted" live={props.props.isError ? "assertive" : "polite"}>{props.props.statusMessage}</Text>;
  if (props.state === "done" || props.state === "twoFactorUnsupported") {
    return <div className={AUTH_PANEL_CLASS_NAME}>{header}<><div className={AUTH_PANEL_NOTICE_CLASS_NAME}>{undefined}

          <Heading level={3}>{props.props.doneTitle}</Heading>


          <Text size="sm" tone="muted">{props.props.doneHint}</Text></div><div className={AUTH_PANEL_NOTICE_ACTIONS_CLASS_NAME}><>{status === undefined ? [] : [status]}

            <Button
              variant="primary"
              onPress={props.on?.onward}
            >{props.props.onwardLabel}</Button></></div></></div>;
  }
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
    return <div className={AUTH_PANEL_CLASS_NAME}>{header}<>


        <form onSubmit={submitCode}>
                                <div className={AUTH_PANEL_FORM_CLASS_NAME}>{[<Input
                                  key="code"
                                  id={CODE_ID}
                                  name="otp"
                                  variant="primary"
                                  kind="code"
                                  label={copy.codeLabel}
                                  placeholder={copy.codePlaceholder}
                                  isDisabled={copy.isPending}
                                  hint={fieldErrors.otp !== undefined ? undefined : fieldErrors.otp ?? copy.codeHint}
                                  errorMessage={fieldErrors.otp !== undefined ? fieldErrors.otp ?? copy.codeHint : undefined}
                                  isError={fieldErrors.otp !== undefined}
                                  onValueChange={value => {
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
              }}
            />]), ...(status === undefined ? [] : [status]), <Button
              key="submit"
              variant="primary"
              type="submit"
              isDisabled={copy.isPending}
              isPending={copy.pendingAction === "submit"}
            >{copy.submitLabel}</Button>]}</div>



          
          
                            </form><div className={AUTH_PANEL_TEXT_ACTIONS_CLASS_NAME}>












          <TextAction size="sm" onPress={isCoolingDown || copy.isPending ? undefined : props.on?.resend}>
            {isCoolingDown ? copy.cooldownLabel : copy.resendLabel}
          </TextAction>



          <TextAction size="sm" onPress={props.on?.back}>{copy.backLabel}</TextAction></div></></div>;
  }
  const copy = props.props;
  const isSignUp = copy.mode === "signUp";
  const isReset = copy.mode === "forgotPassword";
  const submitDetails = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: AuthFieldErrors = {};
    const email = values.current.email.trim();
    if (email === "") nextErrors.email = copy.emailRequired;
    else if (!EMAIL_PATTERN.test(email)) nextErrors.email = copy.emailInvalid;
    if (!isReset && values.current.password === "") nextErrors.password = copy.passwordRequired;
    else if (!isReset && values.current.password.length < MINIMUM_PASSWORD_LENGTH) nextErrors.password = copy.passwordTooShort;
    if (isSignUp && values.current.confirmPassword === "") nextErrors.confirmPassword = copy.confirmPasswordRequired;
    else if (isSignUp && values.current.password !== values.current.confirmPassword) nextErrors.confirmPassword = copy.confirmPasswordMismatch;
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    props.on?.submitDetails?.({
      email,
      password: values.current.password
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
  />])];
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
      isDisabled={copy.isPending}
      isPending={copy.pendingAction === "submit"}
    >{copy.submitLabel}</Button>];
  return <div className={AUTH_PANEL_CLASS_NAME}>{header}<><div className={AUTH_PANEL_DETAILS_CLASS_NAME}><div className={AUTH_PANEL_PROVIDER_CLASS_NAME}><>





            <Button
              variant="outline"
              isDisabled={copy.isPending}
              isPending={copy.pendingAction === "provider"}
              onPress={() => props.on?.chooseProvider?.("google")}
            ><Icon source={nivoIconSource("google", "chip")} usage="chip" />{copy.googleLabel}</Button></>




          <Divider label={copy.orLabel} /></div>



        <form onSubmit={submitDetails}>
                                <div className={AUTH_PANEL_FORM_CLASS_NAME}>{credentialFields}{credentialActions}</div>
          
                            </form></div></><div className={AUTH_PANEL_FOOTER_CLASS_NAME}>







      <Text size="sm" tone="muted">{copy.promptQuestion}</Text>


      <TextAction size="sm" onPress={() => props.on?.changeMode?.(copy.mode === "signIn" ? "signUp" : "signIn")}>{copy.promptAction}</TextAction></div></div>;
};


