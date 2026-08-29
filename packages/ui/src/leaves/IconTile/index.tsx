import { cn, skeletonVariants } from "@heroui/react";
import { Icon, type IconName } from "../Icon";
import { ICON_TILE_BASE_CLASS_NAME, ICON_TILE_SIZE_CLASS_NAMES, ICON_TILE_TONE_CLASS_NAMES } from "./classNames";

/**
 * LEAF - `IconTile`: a glyph on a filled plate, for the one mark that leads a row.
 *
 * WHY IT EXISTS RATHER THAN A DIV AROUND AN ICON. The plate is a size, a radius and a soft fill
 * that have to agree with each other; a caller assembling them by hand agrees differently on the
 * next screen. Here it is one decision, made once.
 *
 * TONE IS A MEANING. The fill and its foreground travel together, so contrast is the theme's
 * problem rather than a guess made per screen.
 */

/** What the plate is saying about the thing it leads. */
export type IconTileTone = "neutral" | "accent" | "success" | "warning" | "danger";

/** Two plate steps; the glyph inside remains the one fixed leading size. */
export type IconTileSize = "sm" | "md";

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type IconTileData = {
  /** The meaning drawn on the plate. */
  readonly icon: IconName;
  /** What the plate is saying. */
  readonly tone?: IconTileTone;
  /** The step. */
  readonly size?: IconTileSize;
};

/** Props for {@link IconTile}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type IconTileProps = {readonly props: IconTileData;readonly isLoading?: boolean;};

/** The fill and its foreground, always as a pair. */
/** The resting shape - the plate at its real size, no glyph. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base();

/**
 * Draw a glyph on a plate.
 *
 * @param input - {@link IconTileProps}
 */
export const IconTile = (props: IconTileProps) => {
  const { props: data, isLoading = false } = props;
  const tone = data.tone ?? "neutral";
  const size = data.size ?? "sm";
  return (
    <span


      data-tone={tone}
      data-size={size}
      data-loading={isLoading ? "true" : "false"}
      aria-hidden={isLoading ? true : undefined}
      className={cn(ICON_TILE_BASE_CLASS_NAME, ICON_TILE_SIZE_CLASS_NAMES[size], isLoading ? RESTING_CLASSES : ICON_TILE_TONE_CLASS_NAMES[tone])}>
      
            {isLoading ? null : <Icon props={{ name: data.icon, role: "leading" }} />}
        </span>);

};

