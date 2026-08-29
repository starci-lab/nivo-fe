import { Link as HeroLink } from "@heroui/react";
import { Icon, type IconName } from "../Icon";

/**
 * LEAF - `NavLink`: one destination in the bar, or one tab under it.
 *
 * SELECTION IS A FACT ABOUT THE ROUTE, not a style. `isCurrent` drives both the underline and
 * `aria-current`, so what a reader sees and what a screen reader is told cannot disagree - which
 * is exactly what happens when the two are set in different places.
 *
 * TWO SHAPES, ONE LEAF. A route in the bar and a tab under it are the same thing at two weights:
 * the tab carries the underline because it changes what is below it, the bar link does not
 * because it changes the whole page.
 */

/** Whether this names a page or a section of one. */
export type NavLinkKind = "route" | "tab";

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type NavLinkData = {
  /** The already-resolved words. */
  readonly label: string;
  /** The meaning drawn before the words, for a tab that carries one. */
  readonly icon?: IconName;
  /** Whether this is where the reader already is. */
  readonly isCurrent?: boolean;
  /** A page destination, or a section of the page. */
  readonly kind?: NavLinkKind;
};

/** Internal route choice reported to the connected navigation owner. */
export type NavLinkActions = {
  readonly press?: () => void;
};

/** Props for {@link NavLink}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type NavLinkProps = {readonly props: NavLinkData;readonly on?: NavLinkActions;readonly isLoading?: boolean;};

/** The set per kind, with the current one carrying its own weight and rule. */
const KIND_CLASSES = {
  route: {
    base: "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm text-muted",
    current: "inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-accent-soft px-3 py-2 text-sm font-semibold text-accent-soft-foreground"
  },
  tab: {
    base: "inline-flex items-center gap-2 border-b-2 border-transparent py-3 text-sm text-muted",
    current: "inline-flex items-center gap-2 border-b-2 border-accent py-3 text-sm font-semibold text-accent"
  }
} as const;

/**
 * Draw one destination.
 *
 * @param input - {@link NavLinkProps}
 */
export const NavLink = (props: NavLinkProps) => NavLinkView(props);
const NavLinkView = ({ props, on }: NavLinkProps) => {
  const kind = KIND_CLASSES[props.kind ?? "route"];
  const isCurrent = props.isCurrent === true;
  return (
    <HeroLink


      data-kind={props.kind ?? "route"}
      data-current={isCurrent ? "true" : "false"}
      onPress={on?.press}
      aria-current={isCurrent ? "page" : undefined}
      className={isCurrent ? kind.current : kind.base}>
      
            {props.icon === undefined ? null : <Icon props={{ name: props.icon, role: "leading" }} />}
            {props.label}
        </HeroLink>);

};

