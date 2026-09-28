import { AppsDashboard } from "@/components/blocks/apps/AppsDashboard";

/** Compose the connected dashboard block without proxying its request states. */
export type AppsPageProps = Record<string, never>;
/** Public API role for AppsPageBase. */
export const AppsPageBase = (props: AppsPageProps) => {
  void props;
  return <AppsDashboard />;
};

