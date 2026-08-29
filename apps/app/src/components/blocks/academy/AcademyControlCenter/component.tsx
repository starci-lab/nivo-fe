import { Button, ChoiceTabs, Heading } from "@nivo/ui";
import { EmptyNotice } from "@nivo/ui/composites/EmptyNotice";
import { AcademyGrowthSummary } from "@/components/blocks/academy/AcademyGrowthSummary";
import { AcademyStudentCrm } from "@/components/blocks/academy/AcademyStudentCrm";
import { AcademyLeadPipeline } from "@/components/blocks/academy/AcademyLeadPipeline";
import { AcademyIntegrationCenter } from "@/components/blocks/academy/AcademyIntegrationCenter";

/** The two jobs performed inside one Academy resource. */
export type AcademyControlCenterProps = AcademyControlCenterViewProps;
/** Public API role for AcademyControlCenterMode. */
export type AcademyControlCenterMode = "growth" | "system";

/** Resolved copy passed into the pure Academy page. */
export type AcademyControlCenterLabels = {
  readonly loading: string;
  readonly refused: string;
  readonly openSite: string;
  readonly tabsLabel: string;
  readonly tabs: ReadonlyArray<{
    readonly id: AcademyControlCenterMode;
    readonly label: string;
  }>;
};

/** Pure page state; domain blocks own their own requests and failures. */
export type AcademyControlCenterViewProps = {
  readonly state: "restoring" | "refused" | "ready";
  readonly title: string;
  readonly siteId: string;
  readonly publicHost?: string;
  readonly mode: AcademyControlCenterMode;
  readonly labels: AcademyControlCenterLabels;
  readonly onSelectMode: (mode: AcademyControlCenterMode) => void;
  readonly onOpenPublicSite: () => void;
};

/** Compose one Academy destination without taking ownership of block requests. */
export const AcademyControlCenterBase = (props: AcademyControlCenterProps) => {
  const {
    state,
    title,
    siteId,
    publicHost,
    mode,
    labels,
    onSelectMode,
    onOpenPublicSite
  }: AcademyControlCenterViewProps = props;
  const settledSections = mode === "growth" ? [<AcademyGrowthSummary key="item-0" siteId={siteId} />, <AcademyStudentCrm key="item-1" siteId={siteId} />, <AcademyLeadPipeline key="item-2" siteId={siteId} />] : [<AcademyIntegrationCenter key="item-0" siteId={siteId} />];
  const sections = state !== "ready" ? [<EmptyNotice key="item-0" props={{
    message: state === "restoring" ? labels.loading : labels.refused
  }} />] : settledSections;
  const publicSite = publicHost === undefined ? undefined : <Button props={{
    label: labels.openSite,
    variant: "secondary",
    size: "sm"
  }} on={{
    press: onOpenPublicSite
  }} />;
  return <div><div>




      <Heading props={{
        content: title,
        level: 1
      }} />{publicSite}</div>





    <ChoiceTabs props={{
      label: labels.tabsLabel,
      selectedKey: mode,
      tabs: labels.tabs,
      variant: "primary"
    }} on={{
      select: key => onSelectMode(key as AcademyControlCenterMode)
    }} />{sections}</div>;
};

