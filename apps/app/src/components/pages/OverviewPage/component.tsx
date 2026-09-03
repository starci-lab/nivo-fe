import { Breadcrumbs } from "@nivo/ui";
import {
  Button,
  PageContainer,
  PrimaryRailLayout,
  SectionHeader
} from "@starci/grammar/core";
import { AgentOSSummary } from "@/components/blocks/console/AgentOSSummary";
import { AppsSummary } from "@/components/blocks/console/AppsSummary";
import { InfrastructureSummary } from "@/components/blocks/console/InfrastructureSummary";
import { OverviewPulse } from "@/components/blocks/console/OverviewPulse";
import { WalletSummary } from "@/components/blocks/console/WalletSummary";
import { OVERVIEW_PAGE_CLASS_NAME, OVERVIEW_SECTION_CLASS_NAME } from "./classNames";

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
    servicesLabel,
    accountLabel,
    onBuildApp
  }: OverviewPageViewProps = props;
  return <PageContainer
    measure="product"
    className={OVERVIEW_PAGE_CLASS_NAME}
    data-contract="GAP-5"
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
    <SectionHeader level={2} title={atAGlanceLabel} />
    <OverviewPulse />
    <PrimaryRailLayout
      align="start"
      railWidth="standard"
      primary={<section
        className={OVERVIEW_SECTION_CLASS_NAME}
        data-contract="GAP-4 MEASURE-2"
      >
        <SectionHeader level={2} title={servicesLabel} />
        <AppsSummary />
        <AgentOSSummary />
      </section>}
      rail={<section
        className={OVERVIEW_SECTION_CLASS_NAME}
        data-contract="GAP-4 MEASURE-2"
      >
        <SectionHeader level={2} title={accountLabel} />
        <WalletSummary />
        <InfrastructureSummary />
      </section>}
    />
  </PageContainer>;
};
