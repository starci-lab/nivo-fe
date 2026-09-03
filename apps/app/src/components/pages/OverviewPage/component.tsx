import { Breadcrumbs } from "@nivo/ui";
import {
  Button,
  PageContainer,
  PrimaryRailLayout,
  SectionHeader
} from "@starci/grammar/common";
import { AgentOSSummary } from "@/components/blocks/console/AgentOSSummary";
import { AppsSummary } from "@/components/blocks/console/AppsSummary";
import { InfrastructureSummary } from "@/components/blocks/console/InfrastructureSummary";
import { OverviewPulse } from "@/components/blocks/console/OverviewPulse";
import { WalletSummary } from "@/components/blocks/console/WalletSummary";
import { OVERVIEW_FRAME_CLASS_NAME, OVERVIEW_SECTION_CLASS_NAME } from "./classNames";

/** Resolved copy and the one page-level command of the operations briefing. */
export type OverviewPageProps = OverviewPageViewProps;
/** Public API role for OverviewPageViewProps. */
export type OverviewPageViewProps = {
  readonly title: string;
  readonly lede: string;
  readonly pathLabel: string;
  readonly consoleLabel: string;
  readonly buildAppLabel: string;
  readonly atAGlanceLabel: string;
  readonly atAGlanceSummary: string;
  readonly servicesLabel: string;
  readonly accountLabel: string;
  readonly onBuildApp: () => void;
};

/** Draw the briefing anatomy; each summary block settles its own slice. */
export const OverviewPageBase = (props: OverviewPageProps) => {
  const {
    title,
    lede,
    pathLabel,
    consoleLabel,
    buildAppLabel,
    atAGlanceLabel,
    atAGlanceSummary,
    servicesLabel,
    accountLabel,
    onBuildApp
  }: OverviewPageViewProps = props;
  return <PageContainer measure="product">
    <div
      className={OVERVIEW_FRAME_CLASS_NAME}
      data-contract="GAP-5"
      data-overview-frame="true"
    >
      <Breadcrumbs props={{
        mode: "trail",
        label: pathLabel,
        steps: [{
          id: "console",
          label: consoleLabel
        }, {
          id: "overview",
          label: title,
          isCurrent: true
        }]
      }} />
      <SectionHeader
        level={1}
        title={title}
        description={lede}
        action={<Button
          size="lg"
          variant="primary"
          onPress={onBuildApp}
        >{buildAppLabel}</Button>}
      />
      <OverviewPulse label={atAGlanceLabel} summary={atAGlanceSummary} />
      <PrimaryRailLayout
        align="start"
        railWidth="standard"
        collapsedOrder="primary-first"
        primary={<div
          className={OVERVIEW_SECTION_CLASS_NAME}
          data-contract="GAP-4 MEASURE-2"
          data-overview-services="true"
        >
          <SectionHeader level={2} title={servicesLabel} />
          <AppsSummary />
          <AgentOSSummary />
        </div>}
        rail={<div
          className={OVERVIEW_SECTION_CLASS_NAME}
          data-contract="GAP-4 MEASURE-2"
          data-overview-account="true"
        >
          <SectionHeader level={2} title={accountLabel} />
          <WalletSummary />
          <InfrastructureSummary />
        </div>}
      />
    </div>
  </PageContainer>;
};
