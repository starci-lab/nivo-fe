import { Tree } from "../Tree"
import type { ContractKey } from "../../contracts"
import type { ContractComponent } from "../../contracts/props"

/**
 * BRANCH - `PressableSurface`: the control around a node that opens something.
 *
 * IT DRAWS ITS OWN CONTROL AND PUTS THE KEY'S NODE INSIDE IT. The branch it replaces rendered
 * somebody else's key ON a button host, which is a caller choosing the element for a key - the one
 * decision CONTRACT-4 refuses, because two call sites of one key would then disagree about what
 * element it is. Here the button is this branch's own, and the arranged node underneath is
 * unchanged: the same key can be pressed on one screen and inert on the next.
 *
 * THE BEHAVIOUR LIVES WITH THE THING THAT BEHAVES. A cursor, a hover answer and a pressed state are
 * claims about reacting to a pointer, and the thing that reacts is the control that owns the
 * handler and the disabled state. Written into the entry instead, the table goes on drawing a
 * pointer over a node whose call site passed no handler at all, and nothing can tell it to stop.
 *
 * ONE GESTURE, ONE ANSWER. A surface whose content NAMES its destination answers hover on that name
 * - the label underlines like the link it stands for - and must not also dim: told twice, the
 * reader learns the whole row is the link and then that one line is. A surface with no such name
 * dims instead, because something has to answer.
 */

/** Which part of the surface answers a hover. */
export type PressableSurfaceHover = "label" | "surface"

/** Props for a contract-owned node wrapped in one native press target. */
export type PressableSurfaceProps<K extends ContractKey> = {
    readonly contract: K
    readonly render: ContractComponent<NoInfer<K>>
    /** The accessible name of the destination. */
    readonly label: string
    readonly press?: () => void
    /** Prevent activation while a route is unavailable or already resolving. */
    readonly disabled?: boolean
    /**
     * Which answer this surface gives on hover.
     *
     * `label` when the content holds a line marked `isPressLabel` - that line underlines and the
     * surface stays put. `surface` when it does not, and the whole thing dims.
     */
    readonly hover?: PressableSurfaceHover
}

/** The control fills its place and reads left, and the press answers back in both modes. */
const BASE_CLASSES = "w-full cursor-pointer text-left text-foreground active:opacity-70"

/** The naming line inside answers the hover, so the surface itself does not move. */
const LABEL_HOVER_CLASSES = `${BASE_CLASSES} group`

/** Nothing inside names the destination, so the surface answers by dimming. */
const SURFACE_HOVER_CLASSES = `${BASE_CLASSES} hover:opacity-80`

/**
 * Wrap validated contract content in one press target.
 *
 * @param input - {@link PressableSurfaceProps}
 */
export const PressableSurface = <const K extends ContractKey>({
    contract,
    render,
    label,
    press,
    disabled = false,
    hover = "surface",
}: PressableSurfaceProps<K>) => (
        <button
            type="button"
            data-component="PressableSurface"
            data-hover={hover}
            aria-label={label}
            onClick={press}
            disabled={disabled}
            aria-busy={disabled || undefined}
            className={hover === "label" ? LABEL_HOVER_CLASSES : SURFACE_HOVER_CLASSES}
        >
            <Tree contract={contract} render={render} />
        </button>
    )

/** Source-level tier marker for the press target that wraps a contract node. */
export const meta = { shape: "branch", world: "pure" } as const
