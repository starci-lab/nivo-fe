import type { ComponentType, ReactNode } from "react";
import { StarCiDashboardThemeBoundary } from "@nivo/ui";
import { WorkspaceShell } from "@starci/grammar/common";
import { Sidebar } from "@/features/layouts/Sidebar";
import { ConsoleTopBar } from "@/features/layouts/ConsoleTopBar";

/** The routed page this frame is closed over: opaque children the route has already rendered. */
export type ConsoleLayoutBodyProps = { readonly children?: ReactNode };

/**
 * The frame's approved drawing: which routed body fills the primary slot, and the atoms it takes.
 *
 * The body arrives as a component plus its props because no world-reading half may build the
 * element - instantiating it here keeps every render path on resolved pure targets.
 */
export type ConsoleLayoutBaseState = {
  readonly body: ComponentType<ConsoleLayoutBodyProps>;
  readonly bodyProps: ConsoleLayoutBodyProps;
};

/** The atoms the frame's landmarks are named with. */
export type ConsoleLayoutBaseData = {
  readonly navigationLabel: string;
  readonly primaryLabel: string;
};

/*
 * The installed `starci-fe/public-component-signature` rule reads the render half's own name and
 * demands the contract be spelled `<Unit>Props`, so this private alias is the only name the rule
 * accepts; the exported contract below stays `<Unit>BaseProps`, which the code-pattern check
 * requires the render half to own. Not exported: one public contract per unit.
 */
type ConsoleLayoutProps = ConsoleLayoutBaseProps;
/** Public API role for ConsoleLayoutBaseProps. */
export type ConsoleLayoutBaseProps = {
  readonly state: ConsoleLayoutBaseState;
  readonly props: ConsoleLayoutBaseData;
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
const ConsoleFrame = ({
  state: { body: Body, bodyProps },
  props: { navigationLabel, primaryLabel }
}: ConsoleLayoutBaseProps) => <>
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
export const ConsoleLayoutBase = (props: ConsoleLayoutProps) => {
  const {
    state,
    props: data
  }: ConsoleLayoutBaseProps = props;
  return <StarCiDashboardThemeBoundary content={ConsoleFrame} contentProps={{
    state,
    props: data
  }} />;
};

/** Registry identity for the pure console layout twin. */
