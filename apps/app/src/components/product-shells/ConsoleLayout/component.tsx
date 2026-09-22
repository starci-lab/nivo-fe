import type { ComponentType } from "react";
import { StarCiDashboardThemeBoundary } from "@nivo/ui";
import { WorkspaceShell } from "@starci/grammar/common";
import { Sidebar } from "@/components/product-shells/Sidebar";
import { ConsoleTopBar } from "@/components/product-shells/ConsoleTopBar";

/** Framework-owned routed body after the route closes it into its main contract. */
export type ConsoleLayoutProps<P extends object> = ConsoleLayoutBaseProps<P>;
/** Public API role for ConsoleLayoutBaseProps. */
export type ConsoleLayoutBaseProps<P extends object> = {
  readonly body: ComponentType<P>;
  readonly bodyProps: P;
  readonly navigationLabel: string;
  readonly primaryLabel: string;
};

/**
 * Draw stable authenticated chrome around one opaque routed page.
 *
 * The navigation band is mounted as a sibling above the shell, never in `WorkspaceShell.header`:
 * that slot is the page-level hero and wraps its content in its own `<header>`, so placing
 * `NavigationFeatureNav` (itself a `<header>`) there would expose two banner landmarks.
 *
 * Compact navigation has exactly one owner per viewport, and the shell owns the whole compact band:
 * `compactNavigation` is the only Grammar mechanism that stays on screen below 70rem, because the
 * top bar's own compact trigger is hidden from 48rem up. The slot holds the same `Sidebar` drawer
 * the rail projects, so the trigger's destinations, labels and focus recovery are identical in
 * every band.
 */
const ConsoleFrame = <P extends object,>({
  body: Body,
  bodyProps,
  navigationLabel,
  primaryLabel
}: ConsoleLayoutBaseProps<P>) => <>
  <ConsoleTopBar />
  <WorkspaceShell
    align="stretch"
    compactNavigation={<Sidebar mode="mobile" />}
    compactNavigationLabel={navigationLabel}
    navigation={<Sidebar />}
    navigationLabel={navigationLabel}
    navigationTrack="intrinsic"
    navigationVisibility="wide"
    primary={<Body {...bodyProps} />}
    primaryLabel={primaryLabel}
  />
</>;

/** Draw stable authenticated chrome around one opaque routed page. */
export const ConsoleLayoutBase = <P extends object,>(props: ConsoleLayoutProps<P>) => {
  const {
    body,
    bodyProps,
    navigationLabel,
    primaryLabel
  }: ConsoleLayoutBaseProps<P> = props;
  return <StarCiDashboardThemeBoundary content={ConsoleFrame<P>} contentProps={{
    body,
    bodyProps,
    navigationLabel,
    primaryLabel
  }} />;
};

