"use client";

import { useState } from "react";
import { Input as HeroInput, skeletonVariants } from "@heroui/react";
import { Icon } from "../Icon";

/**
 * LEAF - `Input`: the box a reader types into.
 *
 * `kind` IS THE WHOLE OF IT. Which keyboard a phone offers, whether a password manager fills it,
 * and what a browser autocompletes are all decided by the type attribute - so the caller names the
 * KIND of secret or address and this file maps it. A caller passing `type` directly would be
 * choosing all three by hand, differently, on the next screen.
 *
 * IT IS UNCONTROLLED, by design: a form that re-renders on every keystroke is a form that loses a
 * character on a slow phone. The value is read at submit from the form itself.
 */

/** What is being typed. Not the HTML type - that is this file's business. */
export type InputKind = "email" | "password" | "newPassword" | "code" | "text";

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type InputData = {
  /** The id the label points at. Required: a box no label names is a box nobody can reach. */
  readonly id: string;
  /** The form field name, for the submitted payload. */
  readonly name: string;
  /** What is being typed. */
  readonly kind?: InputKind;
  /** Example shown while the box is empty. */
  readonly placeholder?: string;
  /** What it starts with, for an uncontrolled box. */
  readonly defaultValue?: string;
  /** Blocks typing - a request already on its way. */
  readonly disabled?: boolean;
  /** Marks the box as refused, so the message beside it is announced with it. */
  readonly isInvalid?: boolean;
  /** Id of supporting copy that describes this control. */
  readonly describedBy?: string;
  /** Accessible name of the password reveal control while hidden. */
  readonly revealLabel?: string;
  /** Accessible name of the password reveal control while visible. */
  readonly hideLabel?: string;
};

/** What typing in it does. */
export type InputActions = {
  /** Called with the current value on every change. */
  readonly change?: (value: string) => void;
};

/** Props for {@link Input}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type InputProps = {readonly props: InputData;readonly on?: InputActions;readonly isLoading?: boolean;};

/** The kind, as the platform's own type attribute plus what it should autocomplete. */
const KINDS = {
  email: { type: "email", autoComplete: "email", inputMode: "email" },
  password: { type: "password", autoComplete: "current-password", inputMode: "text" },
  newPassword: { type: "password", autoComplete: "new-password", inputMode: "text" },
  code: { type: "text", autoComplete: "one-time-code", inputMode: "numeric" },
  text: { type: "text", autoComplete: "off", inputMode: "text" }
} as const;

/** The resting shape - the box at its real height, empty. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
  className: "h-10 w-full"
});

/** The box and its intrinsic reveal affordance share one control boundary. */
const BOX_CLASSES = "relative flex flex-row items-center";

/** The reveal sits inside the input's own inset. */
const REVEAL_CLASSES = "absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted";

/**
 * Draw a box to type into.
 *
 * @param input - {@link InputProps}
 */
export const Input = (props: InputProps) => InputView(props);
const InputView = ({ props, on, isLoading = false }: InputProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const kind = KINDS[props.kind ?? "text"];
  const isSecret = (props.kind ?? "text") === "password" || props.kind === "newPassword";
  const revealLabel = isRevealed ? props.hideLabel : props.revealLabel;
  return (
    <span className={BOX_CLASSES}>
            <HeroInput
        data-kind={props.kind ?? "text"}
        data-loading={isLoading ? "true" : "false"}
        id={props.id}
        name={props.name}
        type={isSecret && isRevealed ? "text" : kind.type}
        autoComplete={kind.autoComplete}
        inputMode={kind.inputMode}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        disabled={props.disabled === true || isLoading}
        aria-invalid={props.isInvalid === true ? true : undefined}
        aria-describedby={props.describedBy}
        fullWidth
        variant="secondary"
        className={isLoading ? RESTING_CLASSES : undefined}
        onChange={(event) => on?.change?.(event.target.value)} />
      
            {!isSecret || revealLabel === undefined ? null :
      <button
        type="button"
        aria-label={revealLabel}
        className={REVEAL_CLASSES}
        onClick={() => setIsRevealed(!isRevealed)}>
        
                    <Icon props={{ name: isRevealed ? "hidePassword" : "revealPassword", role: "chip" }} />
                </button>
      }
        </span>);

};

