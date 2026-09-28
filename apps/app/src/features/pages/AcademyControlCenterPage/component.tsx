import { AcademyControlCenter, type AcademyControlCenterProps } from "@/components/blocks/academy/AcademyControlCenter";

/** The two jobs performed inside one Academy resource. */
export type AcademyControlCenterMode = AcademyControlCenterProps["mode"];

/** Resolved identity and tab the pure page draws. */
export type AcademyControlCenterPageBaseData = {
  readonly siteId: string;
  readonly mode: AcademyControlCenterMode;
};

/** Actions the connected page wires into the pure half. */
export type AcademyControlCenterPageBaseOn = {
  readonly selectMode: (mode: AcademyControlCenterMode) => void;
};

/** Props for {@link AcademyControlCenterPageBase}: atom data plus action commands. */
export type AcademyControlCenterPageProps = {
  readonly props: AcademyControlCenterPageBaseData;
  readonly on: AcademyControlCenterPageBaseOn;
};

/** Compose the connected site block while retaining page-level tab state. */
export const AcademyControlCenterPageBase = (props: AcademyControlCenterPageProps) => {
  const { props: view, on } = props;
  return <AcademyControlCenter siteId={view.siteId} mode={view.mode} onSelectMode={on.selectMode} />;
};
