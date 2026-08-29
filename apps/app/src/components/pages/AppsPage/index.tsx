"use client";

import { AppsPageBase } from "./component";

/** Mount the Apps dashboard compositor; the child block owns all external state. */
export type AppsPageProps = Record<string, never>;
/** Public API role for AppsPage. */
export const AppsPage = (props: AppsPageProps) => {
  void props;
  return <AppsPageBase />;
};

