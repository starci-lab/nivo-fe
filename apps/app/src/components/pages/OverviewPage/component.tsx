import { Breadcrumbs } from "@nivo/ui";
import {
  Button,
  PageContainer,
  PrimaryRailLayout,
  SectionHeader
} from "@starci/grammar/common";
import { OverviewAccount } from "@/components/blocks/console/OverviewAccount";
import { OverviewAddresses } from "@/components/blocks/console/OverviewAddresses";
import { OverviewRuntime } from "@/components/blocks/console/OverviewRuntime";
import { OverviewServices } from "@/components/blocks/console/OverviewServices";
import { OverviewSignals } from "@/components/blocks/console/OverviewSignals";
import { OVERVIEW_FRAME_CLASS_NAME, OVERVIEW_TRACK_CLASS_NAME } from "./classNames";

/** Resolved copy and the one page-level command of the operations overview. */
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

/**
 * Draw the overview anatomy: one level-1 orientation region names the page and holds its one
 * page-level decision; every other region is anchored by its own labelled surface instead of a
 * second heading. Each connected block settles its own slice independently.
 */
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
      <OverviewSignals label={atAGlanceLabel} />
      <PrimaryRailLayout
        align="start"
        railWidth="standard"
        collapsedOrder="primary-first"
        primary={<div
          className={OVERVIEW_TRACK_CLASS_NAME}
          data-contract="GAP-4 MEASURE-2"
          data-overview-primary="true"
        >
          <OverviewServices label={servicesLabel} />
          <OverviewRuntime />
        </div>}
        rail={<div
          className={OVERVIEW_TRACK_CLASS_NAME}
          data-contract="GAP-4 MEASURE-2"
          data-overview-rail="true"
        >
          <OverviewAccount label={accountLabel} />
          <OverviewAddresses />
        </div>}
      />
    </div>
  </PageContainer>;
};

/** Registry identity for the pure overview page twin. */
