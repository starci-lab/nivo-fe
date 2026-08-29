"use client";

import { useState } from "react";
import { AcademyControlCenterPageBase, type AcademyControlCenterMode } from "./component";

/** Exact Academy identity supplied by the resource route. */
export type AcademyControlCenterPageProps = {
  readonly siteId: string;
};

/** Own the Growth/System page composition and delegate site lifecycle to its block. */
export const AcademyControlCenterPage = (props: AcademyControlCenterPageProps) => {
  const {
    siteId
  }: AcademyControlCenterPageProps = props;
  const [mode, setMode] = useState<AcademyControlCenterMode>("growth");
  return <AcademyControlCenterPageBase siteId={siteId} mode={mode} onSelectMode={setMode} />;
};
