import { Button as HeroButton, skeletonVariants, Spinner } from "@heroui/react"
import { Icon, type IconName } from "../Icon"
import type { LeafProps } from "../../contracts/props"

/**
 * LEAF - `Button`: the thing a reader presses.
 *
 * `label` IS REQUIRED EVEN WHILE LOADING, deliberately: the resting control keeps its REAL width,
 * and its real width is the width of its label. A skeleton drawn without one would be a different
 * size from the control it stands in for, and the row would jump the moment data landed.
 *
 * `disabled`, `isPending` AND `isLoading` ARE THREE DIFFERENT FACTS. `disabled` means the action is
 * unavailable before a press. `isPending` means this exact action is running and draws a spinner.
 * `isLoading` is the shared data-loading slot and draws the same skeleton state as every leaf.
 */

/**
 * The closed set of appearances.
 *
 * `primary` is the one honest main action of a surface. `outline` is the alternative a reader may
 * take INSTEAD of the main action - a sign-in shortcut beside a form - and it reads as an equal
 * offer rather than a lesser one, which a filled `secondary` does not.
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost"

/** Control heights. Two, because a third is a size nobody can pick consistently. */
export type ButtonSize = "sm" | "md"

/** What pressing the button means to the form around it. */
export type ButtonType = "button" | "submit" | "reset"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type ButtonData = {
    /** The already-resolved label. Required at rest too - see the file header. */
    readonly label: string
    /** Which of the three appearances this press target wears. */
    readonly variant?: ButtonVariant
    /** The control height. */
    readonly size?: ButtonSize
    /** Form semantics. Defaults to `button` so a stray control cannot submit by accident. */
    readonly type?: ButtonType
    /** The meaning drawn before the label. It inherits the label's colour, never its own. */
    readonly icon?: IconName
    /** Blocks the press because the action is unavailable before it starts. */
    readonly disabled?: boolean
    /** The action is already running; block another press and show progress in this control. */
    readonly isPending?: boolean
}

/** What pressing it does. Handlers travel apart from data: a function is not a `DataValue`. */
export type ButtonActions = {
    /** Called on press. */
    readonly press?: () => void
}

/** Props for {@link Button}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type ButtonProps = LeafProps<ButtonData, ButtonActions>

/** The four appearances, as the vendor names them, so fill and foreground travel together. */
const VARIANTS = { primary: "primary", secondary: "secondary", outline: "outline", ghost: "ghost" } as const

/** The size step, as the vendor names it. */
const SIZES = { sm: "sm", md: "md" } as const

/** Data-loading paint shared with the other leaves; action progress uses a spinner instead. */
const LOADING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

/**
 * Draw a press target.
 *
 * @param input - {@link ButtonProps}
 */
export const Button = ({ props, on, isLoading = false }: ButtonProps) => {
    const variant = props.variant ?? "secondary"
    const size = props.size ?? "md"
    const isPending = props.isPending === true
    /*
     * WHAT SITS BEFORE THE LABEL, decided once. A running action shows its progress there and the
     * meaning glyph stands down for as long as it runs - the two never occupy the slot together, so
     * the choice is one named value rather than a condition read inside another condition.
     */
    const glyph = props.icon === undefined ? null : <Icon props={{ name: props.icon, role: "chip" }} />
    const ornament = isPending ? <Spinner size="sm" className="absolute" aria-hidden="true" /> : glyph
    return (
        <HeroButton
            data-tier="leaf"
            data-component="Button"
            data-variant={variant}
            data-size={size}
            data-loading={isLoading ? "true" : "false"}
            data-action-pending={isPending ? "true" : "false"}
            type={props.type ?? "button"}
            variant={VARIANTS[variant]}
            size={SIZES[size]}
            isDisabled={props.disabled === true || isLoading || isPending}
            onPress={on?.press}
            className={isLoading ? LOADING_CLASSES : "relative"}
        >
            {isLoading ? null : ornament}
            <span className={isPending ? "invisible" : undefined}>{props.label}</span>
        </HeroButton>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
