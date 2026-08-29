import { ProgressBar, skeletonVariants } from "@heroui/react";

/**
 * LEAF - `Progress`: how far along something is, as a bar.
 *
 * `label` IS REQUIRED AND IS NOT DRAWN. A bar is a picture, so the only thing a screen reader has
 * to go on is the name given here - a bar without one announces a percentage of nothing.
 *
 * THE FIGURE IS CLAMPED BY WHOEVER RESOLVES IT, not here. A payload reporting 104 percent is a bug
 * upstream, and a leaf quietly correcting it is a leaf hiding the bug.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type ProgressData = {
  /** Completion, 0 to 100. Absent while loading. */
  readonly value?: number;
  /** What the bar is measuring, for assistive technology. Never drawn. */
  readonly label: string;
};

/** Props for {@link Progress}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type ProgressProps = {readonly props: ProgressData;readonly isLoading?: boolean;};

/** The bar takes the width it is given. */
const BASE_CLASSES = "w-full";

/** The resting shape - a bar of the same height, no fill. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
  className: "h-2 w-full"
});

/**
 * Draw a progress bar.
 *
 * @param input - {@link ProgressProps}
 */
export const Progress = (props: ProgressProps) => ProgressView(props);
const ProgressView = ({ props, isLoading = false }: ProgressProps) => {
  // A resting bar is decoration, not a zero-valued measurement. Rendering the vendor progress
  // primitive before its label exists makes React Aria announce an unnamed control and emit an
  // accessibility warning; the inert span preserves the exact visual seam without lying.
  if (isLoading) {
    return (
      <span


        data-loading="true"
        aria-hidden
        className={RESTING_CLASSES} />);


  }

  return (
    <ProgressBar


      data-loading="false"
      aria-label={props.label}
      value={props.value ?? 0}
      minValue={0}
      maxValue={100}
      color="accent"
      size="sm"
      className={BASE_CLASSES}>
      
            <ProgressBar.Track>
                <ProgressBar.Fill />
            </ProgressBar.Track>
        </ProgressBar>);

};

