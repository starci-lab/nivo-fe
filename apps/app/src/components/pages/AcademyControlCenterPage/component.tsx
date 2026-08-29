import { AcademyControlCenter } from "@/components/blocks/academy/AcademyControlCenter";
import type { AcademyControlCenterMode } from "@/components/blocks/academy/AcademyControlCenter/component";

/** Page-owned route identity and tab composition. */
export type AcademyControlCenterPageProps = AcademyControlCenterPageViewProps;
/** Public API role for AcademyControlCenterPageViewProps. */
export type AcademyControlCenterPageViewProps = {
  readonly siteId: string;
  readonly mode: AcademyControlCenterMode;
  readonly onSelectMode: (mode: AcademyControlCenterMode) => void;
};

/** Compose the connected site block while retaining page-level tab state. */
export const AcademyControlCenterPageBase = (props: AcademyControlCenterPageProps) => <AcademyControlCenter siteId={props.siteId} mode={props.mode} onSelectMode={props.onSelectMode} />;
export type { AcademyControlCenterMode };

