import { useRef, useState, type SubmitEvent } from "react";
import { Button, Checkbox, Divider, Field, Heading, Text, TextLink } from "@nivo/ui";

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
};

/** Copy for the first step. */
export type AuthDetailsCopy = AuthFrame & {
  /** Which journey is running. It selects which fields appear, not which tree. */
  readonly mode: AuthMode;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  /** Said only on the reset journey: the code goes to the address AS TYPED. */
  readonly emailHint: string;
  readonly passwordLabel: string;
  readonly passwordPlaceholder: string;
  /** The backend's own rule, said before it is broken rather than as a refusal after. */
  readonly passwordHint: string;
  readonly confirmPasswordLabel: string;
  readonly confirmPasswordPlaceholder: string;
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
  /** How long the code lasts, in words. */
  readonly codeHint: string;
  readonly newPasswordLabel: string;
  readonly newPasswordPlaceholder: string;
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
  const [hasMismatch, setHasMismatch] = useState(false);

  /*
   * `mark` IS NAMED AND LEFT EMPTY, which is not the same as leaving it out. A concurrent change
   * gave the title pair an optional glyph slot. Saying `undefined` states the design decision out
   * loud: this surface has no glyph above its name.
   */
  const header = <div>{undefined}

    <Heading props={{
      content: props.props.title,
      level: 2
    }} />


    <Text props={{
      content: props.props.subtitle,
      size: "sm",
      tone: "muted"
    }} /></div>;

  /** The one sentence, announced when it is a refusal and merely shown when it is not. */
  const status = props.props.statusMessage === "" ? undefined : <Text props={{
    content: props.props.statusMessage,
    tone: "muted",
    size: "sm",
    live: props.props.isError ? "assertive" : "polite"
  }} />;
  if (props.state === "done" || props.state === "twoFactorUnsupported") {
    return <div>{header}<><div>{undefined}

          <Heading props={{
            content: props.props.doneTitle,
            level: 3
          }} />


          <Text props={{
            content: props.props.doneHint,
            size: "sm",
            tone: "muted"
          }} /></div><div><>{status === undefined ? [] : [status]}

            <Button props={{
              label: props.props.onwardLabel,
              variant: "primary"
            }} on={{
              press: props.on?.onward
            }} /></></div></></div>;
  }
  if (props.state === "code") {
    const copy = props.props;
    const submitCode = (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();
      props.on?.submitCode?.({
        otp: values.current.otp,
        newPassword: values.current.newPassword
      });
    };
    // Only the reset journey spends its code and sets a password in one request, which is what
    // `forgotPasswordVerifyOtp` takes.
    const setsPassword = copy.mode === "forgotPassword";
    const isCoolingDown = copy.cooldownLabel !== "";
    return <div>{header}<>


        <form onSubmit={submitCode}>
                                <div>{[<Field key="item-0" props={{
              id: CODE_ID,
              name: "otp",
              // `code` is what sets autocomplete=one-time-code and
              // inputmode=numeric, which is how a phone offers the
              // code straight from the notification.
              kind: "code",
              label: copy.codeLabel,
              placeholder: copy.codePlaceholder,
              hint: copy.isError ? undefined : copy.codeHint,
              isInvalid: copy.isError,
              disabled: copy.isPending
            }} on={{
              change: value => {
                values.current.otp = value;
              }
            }} />, ...(!setsPassword ? [] : [<Field key="item-0" props={{
              id: NEW_PASSWORD_ID,
              name: "newPassword",
              kind: "newPassword",
              label: copy.newPasswordLabel,
              placeholder: copy.newPasswordPlaceholder,
              hint: copy.newPasswordHint,
              revealLabel: copy.revealLabel,
              hideLabel: copy.hideLabel,
              disabled: copy.isPending
            }} on={{
              change: value => {
                values.current.newPassword = value;
              }
            }} />]), ...(status === undefined ? [] : [status]), <Button key="item-3" props={{
              label: copy.submitLabel,
              variant: "primary",
              type: "submit",
              disabled: copy.isPending,
              isPending: copy.isPending
            }} />]}</div>



          
          
                            </form><div>












          <TextLink props={{
            label: isCoolingDown ? copy.cooldownLabel : copy.resendLabel,
            size: "sm"
          }} on={{
            press: isCoolingDown ? undefined : props.on?.resend
          }} />



          <TextLink props={{
            label: copy.backLabel,
            size: "sm"
          }} on={{
            press: props.on?.back
          }} /></div></></div>;
  }
  const copy = props.props;
  const isSignUp = copy.mode === "signUp";
  const isReset = copy.mode === "forgotPassword";
  const submitDetails = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Whether two boxes hold the same characters is intrinsic to this form. No request answers
    // it, and sending a mismatched pair would spend a code to learn what a comparison knew.
    if (isSignUp && values.current.password !== values.current.confirmPassword) {
      setHasMismatch(true);
      return;
    }
    setHasMismatch(false);
    props.on?.submitDetails?.({
      email: values.current.email,
      password: values.current.password
    });
  };
  const credentialControls = [<Field key="item-0" props={{
    id: EMAIL_ID,
    name: "email",
    kind: "email",
    label: copy.emailLabel,
    placeholder: copy.emailPlaceholder,
    hint: isReset ? copy.emailHint : undefined,
    disabled: copy.isPending,
    isInvalid: copy.isError
  }} on={{
    change: value => {
      values.current.email = value;
    }
  }} />,
  // The reset journey asks for NO password: it proves the inbox first and sets one at step two.
  ...(isReset ? [] : [<Field key="item-0" props={{
    id: PASSWORD_ID,
    name: "password",
    kind: isSignUp ? "newPassword" : "password",
    label: copy.passwordLabel,
    placeholder: copy.passwordPlaceholder,
    hint: isSignUp ? copy.passwordHint : undefined,
    revealLabel: copy.revealLabel,
    hideLabel: copy.hideLabel,
    disabled: copy.isPending,
    isInvalid: copy.isError
  }} on={{
    change: value => {
      values.current.password = value;
    }
  }} />]), ...(!isSignUp ? [] : [<Field key="item-0" props={{
    id: CONFIRM_ID,
    name: "confirmPassword",
    kind: "newPassword",
    label: copy.confirmPasswordLabel,
    placeholder: copy.confirmPasswordPlaceholder,
    hint: hasMismatch ? copy.confirmPasswordMismatch : undefined,
    isInvalid: hasMismatch,
    revealLabel: copy.revealLabel,
    hideLabel: copy.hideLabel,
    disabled: copy.isPending
  }} on={{
    change: value => {
      values.current.confirmPassword = value;
      if (hasMismatch) setHasMismatch(false);
    }
  }} />]),
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
  ...(copy.mode !== "signIn" ? [] : [<div key="item-0">


    <Checkbox props={{
      label: copy.rememberMeLabel,
      isSelected: copy.isRememberMe,
      name: "rememberMe"
    }} on={{
      change: isRemembered => props.on?.changeRememberMe?.(isRemembered)
    }} />



    <TextLink props={{
      label: copy.forgotPasswordLabel,
      size: "sm"
    }} on={{
      press: () => props.on?.changeMode?.("forgotPassword")
    }} /></div>]), ...(status === undefined ? [] : [status]), <Button key="item-5" props={{
    label: copy.submitLabel,
    variant: "primary",
    type: "submit",
    disabled: copy.isPending,
    isPending: copy.isPending
  }} />];
  return <div>{header}<><div><div><>





            <Button props={{
              label: copy.googleLabel,
              variant: "outline",
              icon: "google",
              disabled: copy.isPending
            }} on={{
              press: () => props.on?.chooseProvider?.("google")
            }} /></>




          <Divider props={{
            label: copy.orLabel
          }} /></div>



        <form onSubmit={submitDetails}>
                                <div>{credentialControls}</div>
          
                            </form></div></><div>







      <Text props={{
        content: copy.promptQuestion,
        size: "sm",
        tone: "muted"
      }} />


      <TextLink props={{
        label: copy.promptAction,
        size: "sm"
      }} on={{
        press: () => props.on?.changeMode?.(copy.mode === "signIn" ? "signUp" : "signIn")
      }} /></div></div>;
};


