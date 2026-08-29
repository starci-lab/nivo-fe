import { cn, skeletonVariants } from "@heroui/react";
import { Icon, type IconName } from "../Icon";
import { TEXT_CLASS_NAME, TEXT_PRESS_LABEL_CLASS_NAME } from "./classNames";

/**
 * LEAF - `Text`: one line of resolved copy, at one of two weights of attention.
 *
 * COPY IS DATA. It arrives already translated, in `props.content`, never as children - only a
 * branch assembles, and nothing below one accepts a child.
 *
 * `content` DOES NOT SURVIVE A LOADING PASS, and that answer is this leaf's alone: a text bar has
 * a declared measure of its own, so the line can rest without knowing what it will say. A control
 * whose width IS its label cannot do the same.
 */

/** Whether this is the content itself or a supporting fact beside it. */
export type TextTone = "default" | "muted" | "accent";

/** The reading size. `xs` is reserved for supporting captions beneath primary content. */
export type TextSize = "xs" | "sm" | "md" | "metric-lead";

/** How firmly the words are set. */
export type TextWeight = "normal" | "medium" | "semibold";

/** Whether a change to this line is announced, and how urgently. */
export type TextLive = "off" | "polite" | "assertive";

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
type TextCommonData = {
  /** Optional DOM identity used when another intrinsic control describes itself with this line. */
  readonly id?: string;
  /** The already-resolved copy. Absent while loading - the bar has its own measure. */
  readonly content?: string;
  /** How firmly the words are set. */
  readonly weight?: TextWeight;
  /** The meaning drawn ahead of the words. It inherits this line's colour, never its own. */
  readonly icon?: IconName;
  /**
   * Whether this line is the LABEL of the press target that contains it.
   *
   * A whole row that navigates has no visible edge saying so, and a cursor change alone is a
   * promise only a mouse can read. Underlining the label while the row is hovered is what a link
   * does, said by the one line that names the destination - the rest of the row is evidence about
   * it rather than the thing being opened.
   *
   * It is an OPT-IN, not a default for every line inside a button: two underlines racing on one
   * hover is how a row stops naming one destination.
   */
  readonly isPressLabel?: boolean;
  /** Whether a change to this line is announced, and how urgently. */
  readonly live?: TextLive;
};

/**
 * Twelve-pixel copy is supporting copy by definition, so its tone cannot be promoted independently.
 * The union makes `size: "xs", tone: "default"` unrepresentable instead of relying on every caller
 * to remember that size and tone express one rank.
 */
export type TextData = TextCommonData & (
{readonly size: "xs";readonly tone?: "muted";} |
{readonly size?: Exclude<TextSize, "xs">;readonly tone?: TextTone;});


/** Props for {@link Text}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type TextProps = {readonly props: TextData;readonly isLoading?: boolean;};

/**
 * The role a live line carries. `off` is not a live region at all, so it takes no role - a
 * line claiming `role="status"` while saying nothing would announce every re-render.
 */
const LIVE_ROLES = { off: undefined, polite: "status", assertive: "alert" } as const;

/**
 * The complete text recipe. A plain `div` owns the line box: `xs` is 12/16, `sm` is 14/20 and
 * `md` is 16/24.
 * Data variants keep every possible class literal visible to Tailwind without composing classes
 * at a call site or allowing a typography vendor to silently replace the requested leading.
 */
/** The resting shape - the same line box, wearing the vendor's skeleton, glyphs out. */
const RESTING_CLASSES = {
  xs: skeletonVariants({ animationType: "shimmer" }).base({
    className: "inline-block w-10 select-none rounded text-xs leading-4 text-muted text-transparent"
  }),
  sm: skeletonVariants({ animationType: "shimmer" }).base({
    className: "inline-block w-12 select-none rounded text-sm leading-5 text-transparent"
  }),
  md: skeletonVariants({ animationType: "shimmer" }).base({
    className: "inline-block w-40 max-w-full select-none rounded text-base leading-6 text-transparent"
  }),
  "metric-lead": skeletonVariants({ animationType: "shimmer" }).base({
    className: "inline-block w-40 max-w-full select-none rounded text-3xl leading-9 text-transparent"
  })
} as const;

/**
 * Draw one line of copy.
 *
 * @param input - {@link TextProps}
 */
export const Text = (props: TextProps) => {
  const { props: data, isLoading = false } = props;
  const size = data.size ?? "md";
  const tone = size === "xs" ? "muted" : data.tone ?? "default";
  const weight = data.weight ?? "normal";
  const live = data.live ?? "off";
  // The glyph drops while the line rests: the skeleton already covers the measure, and a glyph
  // shimmering beside it is a second thing to look at where there is nothing to read yet.
  const showsIcon = data.icon !== undefined && !isLoading;
  return (
    <div
      id={data.id}


      data-tone={tone}
      data-size={size}
      data-weight={weight}
      data-icon={showsIcon ? "true" : "false"}
      data-live={live}
      data-loading={isLoading ? "true" : "false"}
      role={LIVE_ROLES[live]}
      aria-live={live === "off" ? undefined : live}
      className={isLoading ? RESTING_CLASSES[size] : cn(TEXT_CLASS_NAME, data.isPressLabel === true ? TEXT_PRESS_LABEL_CLASS_NAME : undefined)}>
      
            {showsIcon && data.icon !== undefined ? <Icon props={{ name: data.icon, role: "chip" }} /> : null}
            {isLoading ? "\u00a0" : data.content ?? ""}
        </div>);

};

