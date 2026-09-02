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

/** Draw stable authenticated chrome around one opaque routed page. */
const ConsoleFrame = <P extends object,>({
  body: Body,
  bodyProps,
  navigationLabel,
  primaryLabel
}: ConsoleLayoutBaseProps<P>) => <WorkspaceShell
  align="stretch"
  header={<ConsoleTopBar />}
  navigation={<Sidebar />}
  navigationLabel={navigationLabel}
  navigationTrack="intrinsic"
  navigationVisibility="wide"
  primary={<Body {...bodyProps} />}
  primaryLabel={primaryLabel}
/>;

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

