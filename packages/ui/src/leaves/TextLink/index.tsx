import { Link as HeroLink, cn } from "@heroui/react";
import { TEXT_LINK_CHOICE_CLASS_NAME, TEXT_LINK_SELECTED_CLASS_NAME, TEXT_LINK_SIZE_CLASS_NAMES } from "./classNames";

/**
 * LEAF - `TextLink`: words that change what is on screen without going anywhere.
 *
 * IT IS A BUTTON, NOT A LINK, and that is the whole reason it is a separate leaf from `Link`.
 * "Sign up instead" does not navigate - it swaps the panel under the reader - so an `<a href>`
 * would lie to a screen reader, offer a middle-click that opens nothing, and put a URL in the
 * status bar that leads somewhere it will not go.
 *
 * IT LOOKS LIKE A LINK because to the reader it is the same gesture, and it is the smallest
 * possible target for a decision that is not the surface's main action.
 */

/** The same two reading steps used by ordinary body copy. */
export type TextLinkSize = "sm" | "md";

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type TextLinkData = {
  /** The already-resolved words. */
  readonly label: string;
  /** The reading step, matched to the sentence this action completes. */
  readonly size?: TextLinkSize;
  /** Whether this peer choice is selected. Omit outside a fixed choice set. */
  readonly isSelected?: boolean;
};

/** What pressing it does. */
export type TextLinkActions = {
  /** Called on press. */
  readonly press?: () => void;
};

/** Props for {@link TextLink}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type TextLinkProps = {readonly props: TextLinkData;readonly on?: TextLinkActions;readonly isLoading?: boolean;};

/** HeroUI Link owns interaction styling; this leaf adds only the house reading step. */
/**
 * Draw a word that acts.
 *
 * @param input - {@link TextLinkProps}
 */
export const TextLink = (props: TextLinkProps) => {
  const { props: data, on } = props;
  return <HeroLink


  data-size={data.size ?? "md"}
  data-selected={data.isSelected}
  aria-current={data.isSelected === true ? "true" : undefined}
  onPress={on?.press}
  className={cn(TEXT_LINK_SIZE_CLASS_NAMES[data.size ?? "md"], data.isSelected === undefined ? undefined : TEXT_LINK_CHOICE_CLASS_NAME, data.isSelected === true ? TEXT_LINK_SELECTED_CLASS_NAME : undefined)}>
  
        {data.label}
    </HeroLink>;
};


