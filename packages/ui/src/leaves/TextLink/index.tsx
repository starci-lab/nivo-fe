import { Link as HeroLink } from "@heroui/react"
import type { LeafProps } from "../../contracts/props"

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
export type TextLinkSize = "sm" | "md"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type TextLinkData = {
    /** The already-resolved words. */
    readonly label: string
    /** The reading step, matched to the sentence this action completes. */
    readonly size?: TextLinkSize
    /** Whether this peer choice is selected. Omit outside a fixed choice set. */
    readonly isSelected?: boolean
}

/** What pressing it does. */
export type TextLinkActions = {
    /** Called on press. */
    readonly press?: () => void
}

/** Props for {@link TextLink}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type TextLinkProps = LeafProps<TextLinkData, TextLinkActions>

/** HeroUI Link owns interaction styling; this leaf adds only the house reading step. */
const SIZE_CLASSES = { sm: "text-sm", md: "text-base" } as const
const CHOICE_CLASSES = "rounded-full px-2 py-1"
const SELECTED_CLASSES = "bg-accent-soft text-accent-soft-foreground"

/**
 * Draw a word that acts.
 *
 * @param input - {@link TextLinkProps}
 */
export const TextLink = ({ props, on }: TextLinkProps) => (
    <HeroLink
        data-tier="leaf"
        data-component="TextLink"
        data-size={props.size ?? "md"}
        data-selected={props.isSelected}
        aria-current={props.isSelected === true ? "true" : undefined}
        onPress={on?.press}
        className={`${SIZE_CLASSES[props.size ?? "md"]} ${props.isSelected === undefined ? "" : CHOICE_CLASSES} ${props.isSelected === true ? SELECTED_CLASSES : ""}`}
    >
        {props.label}
    </HeroLink>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
