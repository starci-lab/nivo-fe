import type { ComponentType } from "react";
import { StarCiDashboardThemeBoundary } from "@nivo/ui";
import { ConsoleNav } from "@/components/layouts/ConsoleNav";
import { ConsoleTopBar } from "@/components/layouts/ConsoleTopBar";

/** Framework-owned routed body after the route closes it into its main contract. */
export type ConsoleLayoutProps<P extends object> = ConsoleLayoutBaseProps<P>;
/** Public API role for ConsoleLayoutBaseProps. */
export type ConsoleLayoutBaseProps<P extends object> = {
  readonly body: ComponentType<P>;
  readonly bodyProps: P;
};

/** Draw stable authenticated chrome around one opaque routed page. */
const ConsoleFrame = <P extends object,>({
  body: Body,
  bodyProps
}: ConsoleLayoutBaseProps<P>) => <div>

  <ConsoleTopBar /><div>

    <ConsoleNav />
    <Body {...bodyProps} /></div></div>;

/** Draw stable authenticated chrome around one opaque routed page. */
export const ConsoleLayoutBase = <P extends object,>(props: ConsoleLayoutProps<P>) => {
  const {
    body,
    bodyProps
  }: ConsoleLayoutBaseProps<P> = props;
  return <StarCiDashboardThemeBoundary content={ConsoleFrame<P>} contentProps={{
    body,
    bodyProps
  }} />;
};

/** Registry identity for the pure console layout twin. */
